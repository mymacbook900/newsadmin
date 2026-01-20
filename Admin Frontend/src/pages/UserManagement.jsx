import React, { useState, useEffect } from 'react';
import { Search, Filter, Shield, Ban, Trash2, Plus, Upload, MapPin, Briefcase, GraduationCap, Download, FileText, CheckCircle, XCircle, User, Mail, Eye, Edit, Power, Users, Clock, Bookmark, Calendar as CalendarIcon, Phone, Activity, TrendingUp, Newspaper, Heart, Share2, MessageSquare, BookOpen, Layers, ShieldAlert, Key, Lock, ThumbsUp, Hash, Languages, PieChart, ArrowLeft } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { getUsersAPI, getUserByIdAPI, addUserAPI, updateUserAPI, updateUserStatusAPI, deleteUserAPI, getReportersAPI, verifyReporterAPI, getUserLogsAPI, getUserAnalyticsAPI } from '../services/userApi';

export default function UserManagement({ initialRole = 'All' }) {
    // Tab logic simplified: 'List' is default. Only Reports have 'Requests'.
    const getTabs = () => {
        if (initialRole === 'Reporter') return ['Verified Reporters', 'Reporter Requests'];
        if (initialRole === 'All') return ['User List', 'Moderation Reports'];
        return ['User List'];
    };

    const [activeTab, setActiveTab] = useState(initialRole === 'Reporter' ? 'Verified Reporters' : 'User List');
    const [users, setUsers] = useState([]);
    const [reporters, setReporters] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState(initialRole);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Modal States
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isEditUserOpen, setIsEditUserOpen] = useState(false); // New Edit Modal State
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // Full user details
    const [userLogs, setUserLogs] = useState([]); // For profile activity tab
    const [userAnalytics, setUserAnalytics] = useState(null); // Performance/Engagement
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'
    const [profileTab, setProfileTab] = useState('Overview'); // Overview, Interests, Activity, Engagement, Saved, Security

    // Add/Edit User Form State
    const [newUser, setNewUser] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '', // MATCH BACKEND SCHEMA
        role: initialRole === 'All' ? 'User' : initialRole, // Default to current page role
        address: '', // MATCH BACKEND SCHEMA
        profilePicture: null // New Image Field
    });

    useEffect(() => {
        setFilterRole(initialRole);
        setActiveTab(initialRole === 'Reporter' ? 'Verified Reporters' : 'User List');
        // Reset Add User Role default
        setNewUser(prev => ({ ...prev, role: initialRole === 'All' ? 'User' : initialRole }));
    }, [initialRole]);

    // Unified fetch logic
    useEffect(() => {
        if (activeTab === 'Reporter Requests' || initialRole === 'Reporter') {
            fetchReporters();
        }
        if (activeTab !== 'Reporter Requests' && activeTab !== 'Moderation Reports') {
            fetchUsers();
        }
        if (activeTab === 'Moderation Reports') {
            fetchReports();
        }
    }, [activeTab, initialRole]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getUsersAPI();
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReporters = async () => {
        setLoading(true);
        try {
            const res = await getReportersAPI();
            setReporters(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { getReportsAPI } = await import('../services/userApi');
            const res = await getReportsAPI();
            setReports(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Enhanced Filter Logic
    const filteredData = (activeTab === 'Reporter Requests' ? reporters : users).filter(item => {
        const matchesSearch = (item.fullName || item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.email || '').toLowerCase().includes(searchTerm.toLowerCase());

        let matchesFilter = true;

        if (activeTab === 'Reporter Requests') {
            matchesFilter = (item.documents?.verificationStatus === 'Pending' || item.documents?.verificationStatus === 'Rejected');
            if (item.role === 'Reporter' && item.documents?.verificationStatus === 'Verified') return false;
        }
        else if (activeTab === 'Verified Reporters') {
            matchesFilter = item.role === 'Reporter';
        }
        else if (initialRole === 'Admin') {
            matchesFilter = item.role === 'Admin';
        }
        else if (initialRole === 'All') {
            matchesFilter = filterRole === 'All' || item.role === filterRole;
        }

        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
            case 'Published':
            case 'Verified': return 'success';
            case 'Pending':
            case 'Investigating': return 'warning';
            case 'Banned':
            case 'Rejected':
            case 'Dismissed': return 'danger';
            default: return 'secondary';
        }
    };

    const getBadgeStyle = (status) => {
        const color = getStatusColor(status);
        return {
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: `var(--${color}-glow)`,
            color: `var(--${color})`,
            border: `1px solid var(--${color})`,
            boxShadow: `0 2px 8px var(--${color}-glow)`
        };
    };


    const handleAction = async (id, action) => {
        try {
            if (action === 'block') {
                await updateUserStatusAPI(id, 'Banned');
                activeTab.includes('Reporter') ? fetchReporters() : fetchUsers();
                if (activeTab === 'Moderation Reports') fetchReports();
            } else if (action === 'activate') {
                await updateUserStatusAPI(id, 'Active');
                activeTab.includes('Reporter') ? fetchReporters() : fetchUsers();
                if (activeTab === 'Moderation Reports') fetchReports();
            }
        } catch (error) {
            console.error(`Action ${action} failed:`, error);
        }
    };

    const handleReportAction = async (reportId, status) => {
        try {
            const { updateReportStatusAPI } = await import('../services/userApi');
            await updateReportStatusAPI(reportId, status);
            fetchReports();
            alert(`Report marked as ${status}`);
        } catch (error) {
            console.error("Failed to update report:", error);
        }
    };

    const handleVerifyAction = async (status) => {
        if (!selectedUser) return;
        try {
            await verifyReporterAPI(selectedUser._id, { status });
            setIsVerifyModalOpen(false);
            fetchReporters();
        } catch (error) {
            console.error("Verification failed:", error);
        }
    };

    const handleDeleteTarget = async (report) => {
        if (!window.confirm(`Are you sure you want to delete this ${report.type}?`)) return;
        try {
            const { deleteNewsAPI, deleteCommentAPI } = await import('../services/userApi');
            if (report.type === 'News') {
                await deleteNewsAPI(report.targetId); // Assuming targetId is stored in report
            } else if (report.type === 'Comment') {
                await deleteCommentAPI(report.postId, report.targetId);
            }
            await handleReportAction(report._id, 'Resolved');
            alert("Content deleted and report resolved.");
        } catch (error) {
            console.error("Deletion failed:", error);
            alert("Failed to delete content. Check console.");
        }
    };

    const openVerifyModal = (user) => {
        setSelectedUser(user);
        setIsVerifyModalOpen(true);
    };

    const openProfileView = async (user) => {
        // Fetch full details
        try {
            setLoading(true);
            const userRes = await getUserByIdAPI(user._id);
            setSelectedUser(userRes.data);

            try {
                const [logRes, analyticsRes] = await Promise.all([
                    getUserLogsAPI(user._id),
                    getUserAnalyticsAPI(user._id)
                ]);
                setUserLogs(logRes.data);
                setUserAnalytics(analyticsRes.data);
                // Ensure selectedUser has the most populated data from analytics
                if (analyticsRes.data.user) {
                    setSelectedUser(analyticsRes.data.user);
                }
            } catch (err) {
                console.warn("Could not fetch logs or analytics", err);
                setUserLogs([]);
                setUserAnalytics(null);
            }

            setProfileTab('Overview');
            setViewMode('details');
        } catch (error) {
            console.error("Failed to load profile details:", error);
        } finally {
            setLoading(false);
        }
    };

    // Image Upload Logic (Base64)
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewUser({ ...newUser, profilePicture: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await addUserAPI(newUser);
            setIsAddUserOpen(false);
            fetchUsers();

            // Reset form
            setNewUser({
                fullName: '',
                email: '',
                password: '',
                phone: '',
                role: 'User',
                address: '',
                profilePicture: null
            });

            alert("User created successfully!");
        } catch (error) {
            console.error("Add user failed:", error);
            alert("Failed to create user. Ensure email is unique.");
        }
    };

    // Edit Logic
    const openEditModal = (user) => {
        console.log("Edit Clicked for:", user);
        setSelectedUser(user);
        setNewUser({
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'User',
            address: user.address || user.location || '',
            profilePicture: user.profilePicture || null
        });
        setIsEditUserOpen(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        try {
            await updateUserAPI(selectedUser._id, newUser);
            setIsEditUserOpen(false);
            fetchUsers(); // or fetchReporters if reporter tab
            if (activeTab === 'Verified Reporters' || activeTab === 'Reporter Requests') fetchReporters();
            alert("User updated successfully!");
        } catch (error) {
            console.error("Update user failed:", error);
            alert("Failed to update user.");
        }
    };


    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    // Helper for rendering form (used by Add & Edit)
    const renderUserForm = (isEdit = false) => (
        <form onSubmit={isEdit ? handleUpdateUser : handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Image Upload Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    {newUser.profilePicture ? (
                        <img src={newUser.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <User size={32} color="#94a3b8" />
                    )}
                </div>
                <div>
                    <label className="button-secondary" style={{
                        padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer',
                        background: 'white', border: '1px solid #e2e8f0', fontSize: '0.875rem', display: 'inline-block'
                    }}>
                        {isEdit ? 'Change Photo' : 'Upload Photo'}
                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                    </label>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                    <input type="text" required value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} placeholder="John Doe" />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone Number</label>
                    <input type="text" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} placeholder="1234567890" />
                </div>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                <input type="email" required value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} placeholder="john@example.com" disabled={isEdit} />
                {/* Email disabled on edit often good practice or make editable */}
            </div>
            {!isEdit && (
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                    <input type="password" required value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} placeholder="Secret password" />
                </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Role</label>
                    <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                        <option value="User">User</option>
                        <option value="Reporter">Reporter</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>
                {newUser.role === 'Reporter' && (
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Region / Location</label>
                        <input type="text" value={newUser.address} onChange={(e) => setNewUser({ ...newUser, address: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }} placeholder="City, State" />
                    </div>
                )}
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button variant="secondary" onClick={() => isEdit ? setIsEditUserOpen(false) : setIsAddUserOpen(false)} type="button">Cancel</Button>
                <Button variant="primary" type="submit">{isEdit ? 'Update User' : 'Create User'}</Button>
            </div>
        </form>
    );

    return (
        <div>
            {viewMode === 'list' && (
                <>
                    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <h1>{initialRole === 'All' ? 'User Management' : `${initialRole}s`}</h1>
                            <p className="text-secondary">
                                {initialRole === 'All' ? 'Manage all users, reporters, and admins' : `Manage and view ${initialRole}s`}
                            </p>
                        </div>
                        {/* Add User Button */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Button onClick={() => {
                                // Reset for generic Add
                                setNewUser({ fullName: '', email: '', password: '', phone: '', role: initialRole === 'All' ? 'User' : initialRole, address: '', profilePicture: null });
                                setIsAddUserOpen(true);
                            }}>
                                <Plus size={18} style={{ marginRight: '8px' }} /> Add User
                            </Button>
                        </div>
                    </div>

                    {/* Tabs (Reporter & All) */}
                    {(initialRole === 'Reporter' || initialRole === 'All') && (
                        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', overflowX: 'auto' }}>
                            {getTabs().map(tab => (
                                <div
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '0.75rem 1.5rem', cursor: 'pointer',
                                        borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                                        color: activeTab === tab ? '#2563eb' : '#64748b',
                                        fontWeight: activeTab === tab ? 600 : 500,
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {tab}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Search & Filter */}
                    <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className="search-bar" style={{ flex: 1, backgroundColor: 'white' }}>
                            <Search size={18} className="search-icon" />
                            <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        {activeTab === 'User List' && initialRole === 'All' && (
                            <div style={{ position: 'relative' }}>
                                <Button variant="secondary" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                                    <Filter size={18} /> Filter
                                </Button>
                                {isFilterOpen && (
                                    <div className="glass-panel dropdown-menu" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 10, background: 'white', padding: '0.5rem', minWidth: '150px' }}>
                                        {['All', 'User', 'Reporter', 'Admin'].map(r => (
                                            <div key={r} onClick={() => { setFilterRole(r); setIsFilterOpen(false); }} style={{ padding: '8px', cursor: 'pointer' }}>{r}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    {activeTab === 'Moderation Reports' ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Target Content</TableHead>
                                    <TableHead>Reporter</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.length > 0 ? reports.map(report => (
                                    <TableRow key={report._id} className="animate-slide-up" style={{ transition: 'background 0.2s', cursor: 'default' }}>
                                        <TableCell><div style={getBadgeStyle(report.type)}>{report.type}</div></TableCell>
                                        <TableCell><span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{report.targetContent}</span></TableCell>
                                        <TableCell><span style={{ color: '#475569' }}>{report.reporter}</span></TableCell>
                                        <TableCell><div style={getBadgeStyle(report.severity)}>{report.severity}</div></TableCell>
                                        <TableCell><div style={getBadgeStyle(report.status)}>{report.status}</div></TableCell>
                                        <TableCell><span style={{ color: '#64748b', fontSize: '0.85rem' }}>{formatDate(report.createdAt)}</span></TableCell>
                                        <TableCell>
                                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                                                {report.status === 'Pending' && (
                                                    <>
                                                        <Button size="sm" variant="success" onClick={() => handleReportAction(report._id, 'Resolved')} style={{ borderRadius: '8px' }}>Resolve</Button>
                                                        <Button size="sm" variant="outline" className="text-danger" onClick={() => handleDeleteTarget(report)} style={{ borderRadius: '8px' }}>Delete</Button>
                                                    </>
                                                )}
                                                {report.status !== 'Pending' && <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>Managed</span>}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No reports found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Mobile</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created Date</TableHead>
                                    <TableHead>Last Login</TableHead>
                                    <TableHead>Logins</TableHead>
                                    {initialRole === 'Reporter' && activeTab !== 'Reporter Requests' && <TableHead>Articles</TableHead>}
                                    {(initialRole === 'Admin' || initialRole === 'All') && <TableHead>User ID</TableHead>}
                                    {activeTab === 'Reporter Requests' && <TableHead>Verification</TableHead>}
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.length > 0 ? filteredData.map((user, idx) => (
                                    <TableRow
                                        key={user._id}
                                        className="animate-slide-up"
                                        style={{
                                            transition: 'all 0.3s ease',
                                            animationDelay: `${idx * 0.05}s`
                                        }}
                                    >
                                        <TableCell>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#1e293b', fontWeight: 700, fontSize: '0.9rem',
                                                    overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                }}>
                                                    {user.profilePicture ? <img src={user.profilePicture} alt="avt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.fullName?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{user.fullName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.role}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell><span style={{ color: '#334155' }}>{user.email}</span></TableCell>
                                        <TableCell><div style={getBadgeStyle(user.role)}>{user.role}</div></TableCell>
                                        <TableCell><span style={{ color: '#64748b', fontFamily: 'monospace' }}>{user.phone || '—'}</span></TableCell>
                                        <TableCell><div style={getBadgeStyle(user.status)}>{user.status}</div></TableCell>
                                        <TableCell><span style={{ color: '#64748b', fontSize: '0.85rem' }}>{formatDate(user.createdAt)}</span></TableCell>
                                        <TableCell><span style={{ color: '#64748b', fontSize: '0.85rem' }}>{user.lastLogin ? new Date(user.lastLogin).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : 'Never'}</span></TableCell>
                                        <TableCell><span style={{ color: '#1e293b', fontWeight: 600, background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{user.loginCount || 0}</span></TableCell>
                                        {initialRole === 'Reporter' && activeTab !== 'Reporter Requests' && <TableCell>{user.articlesCount || 0}</TableCell>}
                                        {(initialRole === 'Admin' || initialRole === 'All') && <TableCell><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: '#2563eb' }}>{user.customId || user._id.slice(-6)}</span></TableCell>}
                                        {activeTab === 'Reporter Requests' && <TableCell><Badge variant={getStatusColor(user.documents?.verificationStatus || 'Pending')}>{user.documents?.verificationStatus || 'Not Applied'}</Badge></TableCell>}
                                        <TableCell>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Button size="sm" variant="ghost" onClick={() => openProfileView(user)} title="View Profile"><Eye size={16} /></Button>
                                                {(initialRole === 'Admin' || initialRole === 'Reporter') && activeTab !== 'Reporter Requests' && (
                                                    <Button size="sm" variant="ghost" title="Edit" onClick={() => openEditModal(user)}><Edit size={16} /></Button>
                                                )}
                                                <Button size="sm" variant="ghost" className={user.status === 'Active' ? 'text-danger' : 'text-success'} onClick={() => handleAction(user._id, user.status === 'Active' ? 'block' : 'activate')} title={user.status === 'Active' ? "Deactivate" : "Activate"}><Power size={16} /></Button>
                                                {activeTab === 'Reporter Requests' && <Button size="sm" variant="outline" onClick={() => openVerifyModal(user)}><FileText size={16} style={{ marginRight: 4 }} /> Verify</Button>}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No users found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </>
            )}

            {/* ADD USER MODAL */}
            <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Add User">
                {renderUserForm(false)}
            </Modal>

            {/* EDIT USER MODAL */}
            <Modal isOpen={isEditUserOpen} onClose={() => setIsEditUserOpen(false)} title="Edit User">
                {renderUserForm(true)}
            </Modal>

            {/* USER PROFILE VIEW (INLINE) */}
            {viewMode === 'details' && selectedUser && (
                <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
                    <Button variant="ghost" onClick={() => { setViewMode('list'); setSelectedUser(null); }} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                        <ArrowLeft size={18} /> Back to Users
                    </Button>
                    <div style={{ padding: '0.5rem' }}>
                        {/* Header Profile Section */}
                        <div style={{
                            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                            padding: '2rem', borderRadius: '16px', color: 'white',
                            display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '20px',
                                background: 'white', color: '#1e293b',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2rem', fontWeight: 800, border: '4px solid rgba(255,255,255,0.2)'
                            }}>
                                {selectedUser.profilePicture ? <img src={selectedUser.profilePicture} alt="avt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selectedUser.fullName?.[0]?.toUpperCase() || 'U'}

                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{selectedUser.fullName}</h2>
                                <p style={{ margin: '4px 0', opacity: 0.8, fontSize: '0.9rem' }}>{selectedUser.email}</p>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '8px' }}>
                                    <Badge variant={getStatusColor(selectedUser.role)}>{selectedUser.role}</Badge>
                                    <Badge variant={getStatusColor(selectedUser.status)}>{selectedUser.status}</Badge>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.6, alignSelf: 'center', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>ID: {selectedUser.customId || selectedUser._id.slice(-6)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modern Tab System */}
                        <div style={{
                            display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
                            background: '#f1f5f9', padding: '6px', borderRadius: '12px',
                            overflowX: 'auto', whiteSpace: 'nowrap'
                        }}>
                            {['Performance', 'Overview', 'Communities', 'Interests', 'Activity', 'Saved', 'Security', 'Performance'].filter((v, i, a) => a.indexOf(v) === i && v !== 'Performance').concat(['Performance']).reverse().filter((v, i, a) => a.indexOf(v) === i).reverse().map(tab => (
                                <div
                                    key={tab}
                                    onClick={() => setProfileTab(tab)}
                                    style={{
                                        padding: '0.6rem 1.2rem', cursor: 'pointer',
                                        borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                                        background: profileTab === tab ? 'white' : 'transparent',
                                        color: profileTab === tab ? '#2563eb' : '#64748b',
                                        boxShadow: profileTab === tab ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {tab}
                                </div>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="glass-card" style={{ padding: '1.5rem', minHeight: '350px' }}>
                            {profileTab === 'Performance' && (
                                <div className="animate-fade-in">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', color: '#1e293b' }}>
                                        <TrendingUp size={20} color="#2563eb" />
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Engagement Analytics</h3>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                        <div style={{ background: '#eff6ff', padding: '1.2rem', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600, marginBottom: '4px' }}>TOTAL POSTS</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a' }}>{selectedUser.articlesCount || 0}</div>
                                        </div>
                                        <div style={{ background: '#ecfdf5', padding: '1.2rem', borderRadius: '12px', border: '1px solid #d1fae5' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginBottom: '4px' }}>PUBLISHED</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#064e3b' }}>{userAnalytics?.reporterStats?.Published || 0}</div>
                                        </div>
                                        <div style={{ background: '#fffbeb', padding: '1.2rem', borderRadius: '12px', border: '1px solid #fef3c7' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, marginBottom: '4px' }}>PENDING</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#78350f' }}>{userAnalytics?.reporterStats?.Pending || 0}</div>
                                        </div>
                                        <div style={{ background: '#fef2f2', padding: '1.2rem', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, marginBottom: '4px' }}>REJECTED</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7f1d1d' }}>{userAnalytics?.reporterStats?.Rejected || 0}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                        <div className="glass-card" style={{ padding: '1rem', background: '#f8fafc' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                                <PieChart size={16} color="#6366f1" />
                                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Topic Distribution</span>
                                            </div>
                                            {userAnalytics?.categoryStats?.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                    {userAnalytics.categoryStats.slice(0, 4).map(stat => (
                                                        <div key={stat.category} style={{ fontSize: '0.85rem' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                                <span>{stat.category}</span>
                                                                <span style={{ fontWeight: 600 }}>{stat.count}</span>
                                                            </div>
                                                            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                                                <div style={{ width: `${Math.min(stat.count * 10, 100)}%`, height: '100%', background: '#6366f1' }}></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.85rem' }}>No data</div>
                                            )}
                                        </div>
                                        <div className="glass-card" style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                                <Activity size={16} color="#f59e0b" />
                                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Engagement</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Time Spent</span>
                                                    <span style={{ fontWeight: 700 }}>{userAnalytics?.engagement?.totalTimeSpent || 0}m</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Views</span>
                                                    <span style={{ fontWeight: 700 }}>{userAnalytics?.engagement?.View || 0}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Comments</span>
                                                    <span style={{ fontWeight: 700 }}>{userAnalytics?.engagement?.Comment || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Author Content Performance */}
                                    {selectedUser.role === 'Reporter' && userAnalytics?.authorPerformance?.authoredNewsDetails?.length > 0 && (
                                        <div style={{ marginTop: '2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem', color: '#1e293b' }}>
                                                <BookOpen size={20} color="#2563eb" />
                                                <h4 style={{ margin: 0, fontSize: '1rem' }}>Content Performance Breakdown</h4>
                                            </div>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                                    <thead>
                                                        <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                            <th style={{ padding: '0 1rem' }}>Article</th>
                                                            <th style={{ padding: '0 1rem' }}>Stats</th>
                                                            <th style={{ padding: '0 1rem' }}>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {userAnalytics.authorPerformance.authoredNewsDetails.map((article) => (
                                                            <tr key={article.id} style={{ background: '#f8fafc' }}>
                                                                <td style={{ padding: '1rem', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                                                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{article.title}</div>
                                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{article.category} • {new Date(article.createdAt).toLocaleDateString()}</div>
                                                                </td>
                                                                <td style={{ padding: '1rem' }}>
                                                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                                                                        <div title="Views" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Eye size={12} /> {article.views}</div>
                                                                        <div title="Likes" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Heart size={12} /> {article.likes}</div>
                                                                        <div title="Shares" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Share2 size={12} /> {article.shares}</div>
                                                                        <div title="Comments" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MessageSquare size={12} /> {article.comments}</div>
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '1rem', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                                                                    <Badge variant={getStatusColor(article.status)} size="sm">{article.status}</Badge>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {profileTab === 'Overview' && (
                                <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact Information</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#334155' }}>
                                            <Mail size={18} color="#94a3b8" />
                                            <span>{selectedUser.email}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#334155' }}>
                                            <Phone size={18} color="#94a3b8" />
                                            <span>{selectedUser.phone || 'Not provided'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#334155' }}>
                                            <MapPin size={18} color="#94a3b8" />
                                            <span>{selectedUser.address || 'Location unknown'}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>System Preferences</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#334155' }}>
                                            <Languages size={18} color="#94a3b8" />
                                            <span>Language: <b>{selectedUser.preferredLanguage || 'English'}</b></span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#334155' }}>
                                            <Eye size={18} color="#94a3b8" />
                                            <span>Theme: <b>{selectedUser.themePreference || 'Light'} Mode</b></span>
                                        </div>
                                    </div>
                                    {selectedUser.bio && (
                                        <div style={{ gridColumn: '1 / -1', marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #cbd5e1' }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.8rem' }}>About</h4>
                                            <p style={{ margin: 0, color: '#475569', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: '1.6' }}>"{selectedUser.bio}"</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {profileTab === 'Communities' && (
                                <div className="animate-fade-in">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem', color: '#1e293b' }}>
                                                <Users size={20} color="#10b981" />
                                                <h4 style={{ margin: 0, fontSize: '1rem' }}>Joined Communities</h4>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                {selectedUser.joinedCommunities?.length > 0 ? selectedUser.joinedCommunities.map(community => (
                                                    <div key={community._id} className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Users size={18} />
                                                        </div>
                                                        <div style={{ flexGrow: 1 }}>
                                                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{community.name}</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{community.membersCount} members</div>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '1rem', textAlign: 'center' }}>No joined communities.</div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem', color: '#1e293b' }}>
                                                <Heart size={20} color="#3b82f6" />
                                                <h4 style={{ margin: 0, fontSize: '1rem' }}>Followed</h4>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                {selectedUser.followingCommunities?.length > 0 ? selectedUser.followingCommunities.map(community => (
                                                    <div key={community._id} className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Heart size={18} />
                                                        </div>
                                                        <div style={{ flexGrow: 1 }}>
                                                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{community.name}</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{community.membersCount} followers</div>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '1rem', textAlign: 'center' }}>No followed communities.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {profileTab === 'Interests' && (
                                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <div style={{ marginBottom: '1.5rem', color: '#1e293b', fontWeight: 600 }}>Preferred Topics & Interests</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center' }}>
                                        {selectedUser.interests?.length > 0 ? selectedUser.interests.map(interest => (
                                            <div key={interest} style={{
                                                padding: '8px 16px', borderRadius: '30px', background: 'white',
                                                border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#334155'
                                            }}>
                                                <Hash size={14} />
                                                {interest}
                                            </div>
                                        )) : (
                                            <div style={{ color: '#94a3b8' }}>No specific interests selected.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {profileTab === 'Security' && (
                                <div className="animate-fade-in">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                        <div className="glass-card" style={{ padding: '1.2rem', background: '#fef2f2', borderColor: '#fee2e2' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <ShieldAlert size={18} color="#ef4444" />
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#991b1b' }}>Failed Logins</span>
                                            </div>
                                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7f1d1d' }}>{selectedUser.failedLoginAttempts || 0}</div>
                                        </div>
                                        <div className="glass-card" style={{ padding: '1.2rem', background: '#f0f9ff', borderColor: '#e0f2fe' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <Lock size={18} color="#0284c7" />
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#075985' }}>Login History</span>
                                            </div>
                                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0c4a6e' }}>{selectedUser.loginCount || 0} sessions</div>
                                            <div style={{ fontSize: '0.7rem', color: '#0369a1', marginTop: '4px' }}>Last: {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Key size={16} /> Password Resets
                                        </div>
                                        {selectedUser.passwordResetHistory?.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {selectedUser.passwordResetHistory.map((date, i) => (
                                                    <div key={i} style={{ padding: '8px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #f1f5f9', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>Reset Event</span>
                                                        <span style={{ fontWeight: 600 }}>{formatDate(date)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>No resets found.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {profileTab === 'Activity' && (
                                <div className="animate-fade-in">
                                    <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#64748b' }}>Platform interactions</div>
                                    {userLogs.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            {userLogs.slice(0, 10).map((log, i) => (
                                                <div key={i} className="glass-card" style={{ padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
                                                    <div style={{ color: '#6366f1' }}>{log.action === 'Like' ? <ThumbsUp size={16} /> : <Activity size={16} />}</div>
                                                    <div style={{ flexGrow: 1 }}>
                                                        <div style={{ fontWeight: 600 }}>{log.action} on {log.targetModel}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.details}</div>
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{formatDate(log.createdAt)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No activity found.</div>
                                    )}
                                </div>
                            )}

                            {profileTab === 'Saved' && (
                                <div className="animate-fade-in">
                                    <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#64748b' }}>Bookmarked articles</div>
                                    {selectedUser.savedContent?.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            {selectedUser.savedContent.map((item, idx) => (
                                                <div key={idx} className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ color: '#3b82f6' }}><Bookmark size={18} /></div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.item?.title || 'Saved Item'}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.itemModel} • Saved {formatDate(item.savedAt)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No bookmarks.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Verify Reporter Modal */}
            <Modal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)} title="Verify Reporter Credentials">
                {selectedUser && (
                    <div style={{ padding: '0.5rem' }}>
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>{selectedUser.fullName}</h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Review the reporter credentials and history before granting access.</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <Button variant="outline" className="text-danger" onClick={() => handleVerifyAction('Rejected')}>Reject</Button>
                            <Button variant="success" onClick={() => handleVerifyAction('Verified')}>Approve & Verify</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
