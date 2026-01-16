import React, { useState, useEffect } from 'react';
import { Search, Filter, Shield, Ban, Trash2, Plus, Upload, MapPin, Briefcase, GraduationCap, Download, FileText, CheckCircle, XCircle, User, Mail, Eye, Edit, Power, Users, Clock, Bookmark, Calendar as CalendarIcon, Phone } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { getUsersAPI, getUserByIdAPI, addUserAPI, updateUserAPI, updateUserStatusAPI, deleteUserAPI, getReportersAPI, verifyReporterAPI, getUserActivityAPI } from '../services/userApi';

export default function UserManagement({ initialRole = 'All' }) {
    // Tab logic simplified: 'List' is default. Only Reports have 'Requests'.
    const getTabs = () => {
        if (initialRole === 'Reporter') return ['Verified Reporters', 'Reporter Requests'];
        return ['User List'];
    };

    const [activeTab, setActiveTab] = useState(initialRole === 'Reporter' ? 'Verified Reporters' : 'User List');
    const [users, setUsers] = useState([]);
    const [reporters, setReporters] = useState([]);
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
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileTab, setProfileTab] = useState('Overview'); // Overview, Communities, Activity, Saved

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
        if (activeTab !== 'Reporter Requests') {
            fetchUsers();
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
            case 'Active': case 'Verified': return 'success';
            case 'Banned': case 'Rejected': return 'danger';
            case 'Pending': return 'warning';
            default: return 'default';
        }
    };

    const handleAction = async (id, action) => {
        try {
            if (action === 'block') {
                await updateUserStatusAPI(id, 'Banned');
                activeTab.includes('Reporter') ? fetchReporters() : fetchUsers();
            } else if (action === 'activate') {
                await updateUserStatusAPI(id, 'Active');
                activeTab.includes('Reporter') ? fetchReporters() : fetchUsers();
            }
        } catch (error) {
            console.error(`Action ${action} failed:`, error);
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

    const openVerifyModal = (user) => {
        setSelectedUser(user);
        setIsVerifyModalOpen(true);
    };

    const openProfileModal = async (user) => {
        // Fetch full details
        try {
            const userRes = await getUserByIdAPI(user._id);
            setSelectedUser(userRes.data);

            // Fetch Activities logic: catch error if not admin or fails
            try {
                const logRes = await getUserActivityAPI(user._id);
                setUserLogs(logRes.data);
            } catch (err) {
                console.warn("Could not fetch logs", err);
                setUserLogs([]);
            }

            setProfileTab('Overview');
            setIsProfileOpen(true);
        } catch (error) {
            console.error("Failed to load profile details:", error);
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
            setNewUser({ fullName: '', email: '', password: '', phone: '', role: 'User', address: '', profilePicture: null });
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

            {/* Tabs (Reporter only) */}
            {initialRole === 'Reporter' && (
                <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                    {getTabs().map(tab => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0.75rem 1.5rem', cursor: 'pointer',
                                borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                                color: activeTab === tab ? '#2563eb' : '#64748b',
                                fontWeight: activeTab === tab ? 600 : 500
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
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created Date</TableHead>
                        {initialRole === 'Reporter' && activeTab !== 'Reporter Requests' && <TableHead>Articles</TableHead>}
                        {initialRole === 'Admin' && <TableHead>Admin ID</TableHead>}
                        {activeTab === 'Reporter Requests' && <TableHead>Verification</TableHead>}
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.length > 0 ? filteredData.map(user => (
                        <TableRow key={user._id}>
                            <TableCell>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden' }}>
                                        {user.profilePicture ? <img src={user.profilePicture} alt="avt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.fullName?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span style={{ fontWeight: 500 }}>{user.fullName}</span>
                                </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell><Badge variant={user.role === 'Admin' ? 'danger' : user.role === 'Reporter' ? 'success' : 'secondary'} size="sm">{user.role}</Badge></TableCell>
                            <TableCell><span style={{ color: '#64748b' }}>{user.phone || 'N/A'}</span></TableCell>
                            <TableCell><Badge variant={getStatusColor(user.status)}>{user.status}</Badge></TableCell>
                            <TableCell><span style={{ color: '#64748b', fontSize: '0.9rem' }}>{formatDate(user.createdAt)}</span></TableCell>
                            {initialRole === 'Reporter' && activeTab !== 'Reporter Requests' && <TableCell>{user.articlesCount || 0}</TableCell>}
                            {initialRole === 'Admin' && <TableCell><span style={{ fontFamily: 'monospace' }}>{user._id.slice(-6)}</span></TableCell>}
                            {activeTab === 'Reporter Requests' && <TableCell><Badge variant={getStatusColor(user.documents?.verificationStatus || 'Pending')}>{user.documents?.verificationStatus || 'Not Applied'}</Badge></TableCell>}
                            <TableCell>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button size="sm" variant="ghost" onClick={() => openProfileModal(user)} title="View Profile"><Eye size={16} /></Button>
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

            {/* ADD USER MODAL */}
            <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Add User">
                {renderUserForm(false)}
            </Modal>

            {/* EDIT USER MODAL */}
            <Modal isOpen={isEditUserOpen} onClose={() => setIsEditUserOpen(false)} title="Edit User">
                {renderUserForm(true)}
            </Modal>

            {/* LINKEDIN STYLE PROFILE MODAL */}
            <Modal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} title="User Profile">
                {selectedUser && (
                    <div className="profile-view" style={{ minWidth: '600px' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', overflow: 'hidden' }}>
                                {selectedUser.profilePicture ? <img src={selectedUser.profilePicture} alt="avt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (selectedUser.fullName?.[0] || 'U')}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{selectedUser.fullName}</h2>
                                <p style={{ color: '#64748b', margin: 0 }}>{selectedUser.headline || selectedUser.email}</p>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <Badge>{selectedUser.role}</Badge>
                                    <Badge variant={getStatusColor(selectedUser.status)}>{selectedUser.status}</Badge>
                                    {selectedUser._id && <span style={{ fontSize: '12px', color: '#94a3b8' }}>ID: {selectedUser._id.slice(-6)}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Profile Tabs */}
                        <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid #e2e8f0', marginTop: '1rem' }}>
                            {['Overview', 'Communities', 'Activity', 'Saved'].map(tab => (
                                <div key={tab} onClick={() => setProfileTab(tab)}
                                    style={{ padding: '0.75rem 0', cursor: 'pointer', borderBottom: profileTab === tab ? '2px solid #2563eb' : 'none', color: profileTab === tab ? '#2563eb' : '#64748b', fontWeight: 500 }}>
                                    {tab}
                                </div>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div style={{ marginTop: '1.5rem', minHeight: '300px' }}>
                            {profileTab === 'Overview' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <h4 style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>CONTACT</h4>
                                        <div style={{ marginBottom: '0.5rem' }}><Mail size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} /> {selectedUser.email}</div>
                                        <div style={{ marginBottom: '0.5rem' }}><Phone size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} /> {selectedUser.phone || 'N/A'}</div>
                                        <div style={{ marginBottom: '0.5rem' }}><MapPin size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} /> {selectedUser.location || selectedUser.address || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <h4 style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>PROFESSIONAL</h4>
                                        <div style={{ marginBottom: '0.5rem' }}><Briefcase size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} /> {selectedUser.position || 'Not Specified'}</div>
                                        <div style={{ marginBottom: '0.5rem' }}><GraduationCap size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} /> {selectedUser.education || 'Not Specified'}</div>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <h4 style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>ABOUT</h4>
                                        <p style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>{selectedUser.about || selectedUser.bio || "No information available."}</p>
                                    </div>
                                </div>
                            )}

                            {profileTab === 'Communities' && (
                                <div>
                                    {selectedUser.joinedCommunities && selectedUser.joinedCommunities.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            {selectedUser.joinedCommunities.map((comm, idx) => (
                                                <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} /></div>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{comm.name}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{comm.membersCount || 0} Members</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-secondary">No joined communities.</p>
                                    )}
                                </div>
                            )}

                            {profileTab === 'Activity' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {userLogs.length > 0 ? userLogs.map(log => (
                                        <div key={log._id} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Clock size={16} />
                                            </div>
                                            <div>
                                                <div>
                                                    <strong>{selectedUser.fullName}</strong> {log.action.toLowerCase()}d a {log.targetModel}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                    {log.details || (log.targetId?.title || log.targetId?.name || "Content")}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-center text-secondary">No recent activity found.</p>
                                    )}
                                </div>
                            )}

                            {profileTab === 'Saved' && (
                                <div>
                                    {selectedUser.savedContent && selectedUser.savedContent.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {selectedUser.savedContent.map((item, idx) => (
                                                <div key={idx} style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>{item.item?.title || item.item?.name || 'Content'}</span>
                                                    <Badge>{item.itemModel}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-secondary">No saved content.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                            <Button variant="secondary" onClick={() => setIsProfileOpen(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Existing Verify Modal */}
            <Modal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)} title="Verify Reporter">
                {selectedUser && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3>{selectedUser.fullName}</h3>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                            <Button variant="danger" onClick={() => handleVerifyAction('Rejected')}>Reject</Button>
                            <Button variant="primary" onClick={() => handleVerifyAction('Verified')}>Approve</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
