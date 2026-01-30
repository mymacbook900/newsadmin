import { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Plus, Users, Settings, MessageSquare, Heart, Share2, Eye, Check, X, Mail, UserPlus, Shield, Edit, Trash2, ArrowLeft, Calendar } from 'lucide-react';
import {
    getCommunitiesAPI, createCommunityAPI, deleteCommunityAPI, updateCommunityAPI,
    sendEmailVerificationAPI, verifyDomainEmailAPI,
    inviteAuthorizedPersonAPI, approveAuthorizedInviteAPI,
    approveJoinRequestAPI, rejectJoinRequestAPI,
    getCommunityPostsAPI, createPostAPI, deletePostAPI,
    likePostAPI, commentOnPostAPI, sharePostAPI, deleteCommentAPI,
    getUsersAPI, removeMemberAPI
} from '../services/userApi';

export default function CommunityManagement() {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ type: 'all', status: 'all' });

    // Creation Wizard State
    const [wizardStep, setWizardStep] = useState(0);
    const [wizardLoading, setWizardLoading] = useState(false);

    // Helper to get image URL from path
    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;

        const apiUrl = import.meta.env.VITE_API_URL;
        const serverUrl = apiUrl.endsWith('/api')
            ? apiUrl.slice(0, -4)
            : apiUrl;

        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${serverUrl}${cleanPath}`;
    };

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCommunity, setNewCommunity] = useState({
        name: '',
        description: '',
        type: 'Single',
        image: '',
        domainEmail: '',
        authorizedEmails: ['', '']
    });
    const [createdCommunityId, setCreatedCommunityId] = useState(null);
    const [otpInput, setOtpInput] = useState('');
    const [generatedOTP, setGeneratedOTP] = useState('');

    // Detail Modal State
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [detailTab, setDetailTab] = useState('overview');
    const [allUsers, setAllUsers] = useState([]);

    // Edit Community State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingCommunity, setEditingCommunity] = useState(null);

    // Comment Modal State
    const [selectedPostForComments, setSelectedPostForComments] = useState(null);

    // Post State
    const [posts, setPosts] = useState([]);
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const [newPost, setNewPost] = useState({
        content: '',
        type: 'Public',
        image: null
    });

    // Event State (NEW)
    const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        eventDate: '',
        eventTime: '',
        location: '',
        image: null
    });

    useEffect(() => {
        fetchCommunities();
        fetchUsers();
    }, []);

    const fetchCommunities = async () => {
        try {
            setLoading(true);
            const res = await getCommunitiesAPI();
            setCommunities(res.data);
        } catch (error) {
            console.error('Fetch communities error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await getUsersAPI();
            setAllUsers(res.data);
        } catch (error) {
            console.error('Fetch users error:', error);
        }
    };

    const fetchPosts = async (communityId) => {
        try {
            const res = await getCommunityPostsAPI(communityId);
            setPosts(res.data);
        } catch (error) {
            console.error('Fetch posts error:', error);
        }
    };

    // ✅ FIXED: Wizard Handlers with proper step progression
    const handleCreateCommunity = async () => {
        try {
            setWizardLoading(true);

            const userDataStr = localStorage.getItem('adminUser');
            const userData = userDataStr ? JSON.parse(userDataStr) : null;
            const creatorId = userData?._id || userData?.id;

            if (!creatorId) {
                alert('No creator session found. Please log in again.');
                return;
            }

            // Validate based on type
            if (newCommunity.type === 'Single' && !newCommunity.domainEmail.trim()) {
                alert('Domain email is required for Single Creator communities');
                return;
            }

            if (newCommunity.type === 'Multi') {
                const validEmails = newCommunity.authorizedEmails.filter(e => e.trim());
                if (validEmails.length < 2) {
                    alert('At least 2 authorized persons are required for Multi-User communities');
                    return;
                }
            }

            const payload = {
                name: newCommunity.name,
                description: newCommunity.description,
                type: newCommunity.type,
                image: newCommunity.image || '',
                creatorId,
                authorizedPersons:
                    newCommunity.type === 'Multi'
                        ? newCommunity.authorizedEmails.filter(e => e.trim())
                        : [],
                domainEmail:
                    newCommunity.type === 'Single'
                        ? newCommunity.domainEmail
                        : ''
            };

            console.log('Creating community with payload:', payload);

            const res = await createCommunityAPI(payload);
            
            // ✅ Store the created community ID
            const communityId = res.data._id || res.data.id || res.data.community?._id;
            setCreatedCommunityId(communityId);
            
            console.log('Community created with ID:', communityId);

            // ✅ Move to appropriate wizard step based on type
            if (newCommunity.type === 'Single') {
                setWizardStep(1); // Email verification
                // Optionally auto-send OTP
                setTimeout(() => handleSendEmailOTP(), 500);
            } else {
                setWizardStep(2); // Authorize persons
            }

        } catch (error) {
            console.error('Create community error:', error.response?.data || error.message);
            alert(error.response?.data?.message || 'Community creation failed');
        } finally {
            setWizardLoading(false);
        }
    };

    const handleSendEmailOTP = async () => {
        try {
            setWizardLoading(true);
            
            if (!createdCommunityId) {
                alert('No community ID found. Please try creating the community again.');
                return;
            }

            const res = await sendEmailVerificationAPI({
                communityId: createdCommunityId,
                domainEmail: newCommunity.domainEmail
            });
            
            setGeneratedOTP(res.data.otp);
            alert(`OTP sent to ${newCommunity.domainEmail}. (For testing: ${res.data.otp})`);
        } catch (error) {
            console.error('Send OTP error:', error);
            alert(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setWizardLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        try {
            setWizardLoading(true);

            await verifyDomainEmailAPI({
                communityId: createdCommunityId,
                otp: otpInput
            });
            
            alert('Email verified! Community is now active.');
            closeWizard();
            fetchCommunities();
        } catch (error) {
            console.error('Verify email error:', error);
            alert(error.response?.data?.message || 'Invalid OTP or verification failed');
        } finally {
            setWizardLoading(false);
        }
    };

    const handleInviteAuthorized = async () => {
        try {
            setWizardLoading(true);

            const validEmails = newCommunity.authorizedEmails.filter(e => e.trim());
            if (validEmails.length < 2) {
                alert('Please add at least 2 authorized persons');
                return;
            }

            if (!createdCommunityId) {
                alert('No community ID found. Please try creating the community again.');
                return;
            }

            for (const email of validEmails) {
                await inviteAuthorizedPersonAPI(createdCommunityId, { email });
            }
            
            alert(`Invitations sent to ${validEmails.length} users. They will receive OTP via email.`);
            closeWizard();
            fetchCommunities();
        } catch (error) {
            console.error('Invite authorized error:', error.response?.data || error.message);
            alert(`Failed to send invitations: ${error.response?.data?.message || error.message}`);
        } finally {
            setWizardLoading(false);
        }
    };

    const closeWizard = () => {
        setIsCreateOpen(false);
        setWizardStep(0);
        setNewCommunity({
            name: '',
            description: '',
            type: 'Single',
            image: '',
            domainEmail: '',
            authorizedEmails: ['', '']
        });
        setCreatedCommunityId(null);
        setOtpInput('');
        setGeneratedOTP('');
        setWizardLoading(false);
    };

    // Community Actions
    const handleDeleteCommunity = async (id) => {
        if (confirm('Are you sure you want to delete this community?')) {
            try {
                await deleteCommunityAPI(id);
                fetchCommunities();
                alert('Community deleted successfully');
            } catch (error) {
                console.error('Delete error:', error);
                alert('Failed to delete community');
            }
        }
    };

    const handleApproveJoinRequest = async (communityId, userId) => {
        try {
            await approveJoinRequestAPI({ communityId, userId });
            alert('Join request approved');
            if (selectedCommunity) {
                const res = await getCommunitiesAPI();
                const updated = res.data.find(c => c._id === communityId);
                setSelectedCommunity(updated);
            }
            fetchCommunities();
        } catch (error) {
            console.error('Approve error:', error);
            alert('Failed to approve join request');
        }
    };

    const handleRejectJoinRequest = async (communityId, userId) => {
        try {
            await rejectJoinRequestAPI({ communityId, userId });
            alert('Join request rejected');
            if (selectedCommunity) {
                const res = await getCommunitiesAPI();
                const updated = res.data.find(c => c._id === communityId);
                setSelectedCommunity(updated);
            }
            fetchCommunities();
        } catch (error) {
            console.error('Reject error:', error);
            alert('Failed to reject join request');
        }
    };

    const handleApproveAuthorizedInvite = async (email, otp) => {
        try {
            if (!otp) {
                alert('Please enter OTP');
                return;
            }

            // Find user by email from allUsers
            const user = allUsers.find(u => u.email === email);
            
            console.log('Approving invite:', {
                communityId: selectedCommunity._id,
                email: email,
                userId: user?._id,
                otp: otp
            });

            // Try with userId first, if user exists
            if (user) {
                await approveAuthorizedInviteAPI({
                    communityId: selectedCommunity._id,
                    userId: user._id,
                    otp: otp
                });
            } else {
                // Fallback: send email if user not found in allUsers
                await approveAuthorizedInviteAPI({
                    communityId: selectedCommunity._id,
                    email: email,
                    otp: otp
                });
            }

            alert('Invitation approved!');
            const res = await getCommunitiesAPI();
            const updated = res.data.find(c => c._id === selectedCommunity._id);
            setSelectedCommunity(updated);
            fetchCommunities();
        } catch (error) {
            console.error('Approve invite error:', error.response?.data || error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleResendOTP = async (email) => {
        try {
            await inviteAuthorizedPersonAPI(selectedCommunity._id, { email });
            alert('OTP resent successfully');
            const res = await getCommunitiesAPI();
            const updated = res.data.find(c => c._id === selectedCommunity._id);
            setSelectedCommunity(updated);
        } catch (error) {
            console.error('Resend OTP error:', error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    // Post Actions
    const handleCreatePost = async () => {
        try {
            const userDataStr = localStorage.getItem('adminUser');
            const userData = userDataStr ? JSON.parse(userDataStr) : null;
            const userId = userData?._id || userData?.id;

            if (!userId) {
                alert('No user session found. Please log in again.');
                return;
            }

            const formData = new FormData();
            formData.append('communityId', selectedCommunity._id);
            formData.append('content', newPost.content);
            formData.append('type', newPost.type);
            formData.append('authorName', userData?.name || userData?.fullName);
            formData.append('userId', userId);
            if (newPost.image) {
                formData.append('image', newPost.image);
            }

            await createPostAPI(formData);
            setIsCreatePostOpen(false);
            setNewPost({ content: '', type: 'Public', image: null });
            fetchPosts(selectedCommunity._id);
            alert('Post created successfully');
        } catch (error) {
            console.error('Create post error:', error.response?.data || error.message);
            alert(`Failed to create post: ${error.response?.data?.message || error.message}`);
        }
    };

    // Event Actions (NEW)
    const handleCreateEvent = async () => {
        try {
            const userDataStr = localStorage.getItem('adminUser');
            const userData = userDataStr ? JSON.parse(userDataStr) : null;
            const userId = userData?._id || userData?.id;

            if (!userId) {
                alert('No user session found. Please log in again.');
                return;
            }

            // Combine event details into content
            const eventContent = `📅 ${newEvent.title}

${newEvent.description}

📍 Location: ${newEvent.location || 'To be announced'}
🕐 Date & Time: ${newEvent.eventDate} ${newEvent.eventTime ? `at ${newEvent.eventTime}` : ''}`;

            const formData = new FormData();
            formData.append('communityId', selectedCommunity._id);
            formData.append('content', eventContent);
            formData.append('type', 'Event');
            formData.append('authorName', userData?.name || userData?.fullName);
            formData.append('userId', userId);
            if (newEvent.image) {
                formData.append('image', newEvent.image);
            }

            await createPostAPI(formData);
            setIsCreateEventOpen(false);
            setNewEvent({ 
                title: '', 
                description: '', 
                eventDate: '', 
                eventTime: '', 
                location: '', 
                image: null 
            });
            fetchPosts(selectedCommunity._id);
            alert('Event created successfully');
        } catch (error) {
            console.error('Create event error:', error.response?.data || error.message);
            alert(`Failed to create event: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleLikePost = async (postId) => {
        try {
            await likePostAPI(postId);
            fetchPosts(selectedCommunity._id);
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const handleSharePost = async (postId) => {
        try {
            await sharePostAPI(postId);
            fetchPosts(selectedCommunity._id);
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        if (confirm('Are you sure you want to delete this post?')) {
            try {
                await deletePostAPI(postId);
                fetchPosts(selectedCommunity._id);
                alert('Post deleted successfully');
            } catch (error) {
                console.error('Delete post error:', error);
                alert('Failed to delete post');
            }
        }
    };

    const handleUpdateCommunity = async () => {
        try {
            await updateCommunityAPI(editingCommunity._id, editingCommunity);
            setIsEditOpen(false);
            setEditingCommunity(null);
            fetchCommunities();
            alert('Community updated successfully');
        } catch (error) {
            console.error('Update community error:', error);
            alert('Failed to update community');
        }
    };

    const handleRemoveMember = async (userId) => {
        if (confirm('Are you sure you want to remove this member?')) {
            try {
                await removeMemberAPI(selectedCommunity._id, userId);
                const res = await getCommunitiesAPI();
                const updated = res.data.find(c => c._id === selectedCommunity._id);
                setSelectedCommunity(updated);
                fetchCommunities();
                alert('Member removed');
            } catch (error) {
                console.error('Remove member error:', error);
                alert('Failed to remove member');
            }
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (confirm('Are you sure you want to delete this comment?')) {
            try {
                const res = await deleteCommentAPI(postId, commentId);
                setPosts(posts.map(p => p._id === postId ? res.data : p));
                alert('Comment deleted');
            } catch (error) {
                console.error('Delete comment error:', error);
                alert('Failed to delete comment');
            }
        }
    };

    // Filtered Communities
    const filteredCommunities = communities.filter(c => {
        if (filter.type !== 'all' && c.type !== filter.type) return false;
        if (filter.status !== 'all' && c.status !== filter.status) return false;
        return true;
    });

    return (
        <div>
            <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h1>Community Management</h1>
                        <p className="text-secondary">Manage communities, members, and posts</p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus size={18} style={{ marginRight: '8px' }} /> Create Community
                    </Button>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <select
                        value={filter.type}
                        onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                        style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                    >
                        <option value="all">All Types</option>
                        <option value="Single">Single Creator</option>
                        <option value="Multi">Multi-User</option>
                    </select>
                    <select
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                    >
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Communities Table */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Community</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Creator</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Followers</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredCommunities.length > 0 ? filteredCommunities.map((community) => (
                        <TableRow key={community._id}>
                            <TableCell>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ padding: '0.5rem', background: '#e0e7ff', borderRadius: '0.375rem', color: '#4f46e5' }}>
                                        <Users size={18} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{community.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{community.description}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={community.type === 'Single' ? 'secondary' : 'primary'}>
                                    {community.type}
                                </Badge>
                            </TableCell>
                            <TableCell>{community.creator?.fullName || 'Unknown'}</TableCell>
                            <TableCell>{community.members?.length || 0}</TableCell>
                            <TableCell>{community.followersCount || 0}</TableCell>
                            <TableCell>
                                <Badge variant={community.status === 'Active' ? 'success' : 'default'}>
                                    {community.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedCommunity(community);
                                            setDetailTab('overview');
                                            fetchPosts(community._id);
                                        }}
                                    >
                                        <Eye size={18} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setEditingCommunity(community);
                                            setIsEditOpen(true);
                                        }}
                                    >
                                        <Edit size={18} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteCommunity(community._id)}
                                        style={{ color: 'red' }}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                                {loading ? 'Loading...' : 'No communities found'}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* ✅ FIXED: Creation Wizard Modal with proper step handling */}
            <Modal
                isOpen={isCreateOpen}
                onClose={closeWizard}
                title={
                    wizardStep === 0 
                        ? 'Create Community' 
                        : wizardStep === 1 
                        ? 'Email Verification' 
                        : 'Invite Authorized Persons'
                }
            >
                {wizardLoading && (
                    <div style={{ textAlign: 'center', padding: '1rem', marginBottom: '1rem', background: '#f8fafc', borderRadius: '4px' }}>
                        Processing...
                    </div>
                )}

                {wizardStep === 0 && (
                    <div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Community Name *</label>
                            <input
                                type="text"
                                value={newCommunity.name}
                                onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                placeholder="e.g., Tech Innovators"
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                            <textarea
                                value={newCommunity.description}
                                onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', minHeight: '80px' }}
                                placeholder="Describe your community..."
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Community Type *</label>
                            <select
                                value={newCommunity.type}
                                onChange={(e) => setNewCommunity({ ...newCommunity, type: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            >
                                <option value="Single">Single Creator (Email Verification Required)</option>
                                <option value="Multi">Multi-User (Requires 2+ Authorized Persons)</option>
                            </select>
                        </div>

                        {/* ✅ Conditional fields based on type */}
                        {newCommunity.type === 'Single' && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Domain Email *</label>
                                <input
                                    type="email"
                                    value={newCommunity.domainEmail}
                                    onChange={(e) => setNewCommunity({ ...newCommunity, domainEmail: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                    placeholder="admin@yourdomain.com"
                                />
                                <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                    You'll need to verify this email to activate the community
                                </small>
                            </div>
                        )}

                        {newCommunity.type === 'Multi' && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Authorized Persons (Minimum 2) *
                                </label>
                                {newCommunity.authorizedEmails.map((email, index) => (
                                    <div key={index} style={{ marginBottom: '0.5rem' }}>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                const updated = [...newCommunity.authorizedEmails];
                                                updated[index] = e.target.value;
                                                setNewCommunity({ ...newCommunity, authorizedEmails: updated });
                                            }}
                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                            placeholder={`person${index + 1}@example.com`}
                                        />
                                    </div>
                                ))}
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setNewCommunity({ 
                                        ...newCommunity, 
                                        authorizedEmails: [...newCommunity.authorizedEmails, ''] 
                                    })}
                                    style={{ marginTop: '0.5rem' }}
                                >
                                    + Add Another Person
                                </Button>
                                <small style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                    They'll receive OTP via email to approve the community
                                </small>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                            <Button variant="secondary" onClick={closeWizard} disabled={wizardLoading}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleCreateCommunity} 
                                disabled={
                                    wizardLoading ||
                                    !newCommunity.name.trim() || 
                                    (newCommunity.type === 'Single' && !newCommunity.domainEmail.trim()) ||
                                    (newCommunity.type === 'Multi' && newCommunity.authorizedEmails.filter(e => e.trim()).length < 2)
                                }
                            >
                                Create Community
                            </Button>
                        </div>
                    </div>
                )}

                {wizardStep === 1 && newCommunity.type === 'Single' && (
                    <div>
                        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#eff6ff', borderRadius: '4px' }}>
                            <Mail size={20} style={{ marginBottom: '0.5rem' }} />
                            <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0 }}>
                                A verification code will be sent to: <strong>{newCommunity.domainEmail}</strong>
                            </p>
                        </div>

                        {!generatedOTP && (
                            <Button 
                                onClick={handleSendEmailOTP} 
                                disabled={wizardLoading || !createdCommunityId}
                                style={{ marginBottom: '1rem', width: '100%' }}
                            >
                                Send Verification Code
                            </Button>
                        )}

                        {generatedOTP && (
                            <div>
                                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fef3c7', borderRadius: '4px' }}>
                                    <small style={{ fontSize: '0.75rem', color: '#92400e' }}>
                                        For testing: OTP is <strong>{generatedOTP}</strong>
                                    </small>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                        Enter Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        value={otpInput}
                                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '1rem', letterSpacing: '0.2em', textAlign: 'center' }}
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                    <Button 
                                        variant="secondary" 
                                        onClick={handleSendEmailOTP}
                                        disabled={wizardLoading}
                                    >
                                        Resend Code
                                    </Button>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <Button 
                                            variant="secondary" 
                                            onClick={closeWizard}
                                            disabled={wizardLoading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            onClick={handleVerifyEmail} 
                                            disabled={wizardLoading || otpInput.length !== 6}
                                        >
                                            Verify & Activate
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {wizardStep === 2 && newCommunity.type === 'Multi' && (
                    <div>
                        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fef3c7', borderRadius: '4px' }}>
                            <UserPlus size={20} style={{ marginBottom: '0.5rem' }} />
                            <p style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem' }}>
                                Invitations will be sent to the following authorized persons:
                            </p>
                            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
                                {newCommunity.authorizedEmails.filter(e => e.trim()).map((email, idx) => (
                                    <li key={idx} style={{ fontSize: '0.875rem', color: '#92400e' }}>{email}</li>
                                ))}
                            </ul>
                            <p style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.5rem', marginBottom: 0 }}>
                                At least 2 must verify via OTP to activate the community.
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <Button 
                                variant="secondary" 
                                onClick={closeWizard}
                                disabled={wizardLoading}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleInviteAuthorized}
                                disabled={wizardLoading}
                            >
                                Send Invitations
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Community Detail Modal */}
            <Modal
                isOpen={!!selectedCommunity}
                onClose={() => setSelectedCommunity(null)}
                title={selectedCommunity?.name || 'Community Details'}
                size="large"
            >
                {selectedCommunity && (
                    <div>
                        {/* Tabs */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedCommunity(null)}
                                style={{ padding: '0.5rem', marginRight: '-1rem' }}
                            >
                                <ArrowLeft size={20} />
                            </Button>
                            {['overview', 'members', 'posts', 'events'].map((tab) => (
                                <div
                                    key={tab}
                                    onClick={() => setDetailTab(tab)}
                                    style={{
                                        padding: '0.75rem 0',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        color: detailTab === tab ? '#2563eb' : '#64748b',
                                        borderBottom: detailTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {tab}
                                </div>
                            ))}
                        </div>

                        {/* Overview Tab */}
                        {detailTab === 'overview' && (
                            <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Type</div>
                                        <Badge variant={selectedCommunity.type === 'Single' ? 'secondary' : 'primary'}>
                                            {selectedCommunity.type}
                                        </Badge>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Status</div>
                                        <Badge variant={selectedCommunity.status === 'Active' ? 'success' : 'default'}>
                                            {selectedCommunity.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Members</div>
                                        <div style={{ fontWeight: 500 }}>{selectedCommunity.membersCount || 0}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Followers</div>
                                        <div style={{ fontWeight: 500 }}>{selectedCommunity.followersCount || 0}</div>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Created By</div>
                                        <div style={{ fontWeight: 500 }}>
                                            {selectedCommunity.creator?.fullName} ({selectedCommunity.creator?.email})
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Description</div>
                                    <p>{selectedCommunity.description || 'No description'}</p>
                                </div>

                                {selectedCommunity.type === 'Multi' && selectedCommunity.pendingAuthorizedPersons?.length > 0 && (
                                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Shield size={18} color="#2563eb" /> Pending Authorization Invites
                                        </h4>
                                        {selectedCommunity.pendingAuthorizedPersons.map((invite, index) => (
                                            <div key={invite._id || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'white', borderRadius: '4px', marginBottom: '0.5rem', border: '1px solid #f1f5f9' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{invite.email}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                        OTP Sent {invite.otp && `(For testing: ${invite.otp})`}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter OTP"
                                                        id={`otp-input-${invite._id || index}`}
                                                        maxLength="6"
                                                        style={{ width: '100px', padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.875rem', textAlign: 'center' }}
                                                        onKeyPress={(e) => {
                                                            // Only allow numbers
                                                            if (!/[0-9]/.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    />
                                                    <Button size="sm" onClick={() => {
                                                        const inputId = `otp-input-${invite._id || index}`;
                                                        const val = document.getElementById(inputId)?.value;
                                                        if (val && val.length > 0) {
                                                            handleApproveAuthorizedInvite(invite.email, val);
                                                        } else {
                                                            alert('Please enter OTP');
                                                        }
                                                    }}>
                                                        Verify
                                                    </Button>
                                                    <Button size="sm" variant="secondary" onClick={() => handleResendOTP(invite.email)}>
                                                        Resend
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Members Tab */}
                        {detailTab === 'members' && (
                            <div>
                                {selectedCommunity.joinRequests?.length > 0 && (
                                    <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fef3c7', borderRadius: '4px' }}>
                                        <h4 style={{ marginBottom: '0.5rem' }}>Join Requests ({selectedCommunity.joinRequests.length})</h4>
                                        {selectedCommunity.joinRequests.map((userId) => {
                                            const user = allUsers.find(u => u._id === userId);
                                            return (
                                                <div key={userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
                                                    <span>{user?.fullName || 'Unknown User'}</span>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <Button size="sm" onClick={() => handleApproveJoinRequest(selectedCommunity._id, userId)}>
                                                            <Check size={14} /> Approve
                                                        </Button>
                                                        <Button size="sm" variant="secondary" onClick={() => handleRejectJoinRequest(selectedCommunity._id, userId)}>
                                                            <X size={14} /> Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <h4 style={{ marginBottom: '0.5rem' }}>Members ({selectedCommunity.membersCount || 0})</h4>
                                <div>
                                    {selectedCommunity.members?.map((memberId) => {
                                        const user = allUsers.find(u => u._id === memberId);
                                        return (
                                            <div key={memberId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                                <span>{user?.fullName || 'Unknown User'}</span>
                                                {selectedCommunity.creator?._id !== memberId && (
                                                    <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(memberId)} style={{ color: 'red' }}>
                                                        <X size={14} /> Remove
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Posts Tab */}
                        {detailTab === 'posts' && (
                            <div>
                                <Button onClick={() => setIsCreatePostOpen(true)} style={{ marginBottom: '1rem' }}>
                                    <Plus size={16} style={{ marginRight: '4px' }} /> Create Post
                                </Button>
                                <div>
                                    {posts.filter(p => p.type !== 'Event').length > 0 ? posts.filter(p => p.type !== 'Event').map((post) => (
                                        <div key={post._id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <div style={{ fontWeight: 500 }}>{post.authorName}</div>
                                                <Badge variant={post.type === 'Public' ? 'success' : post.type === 'Member' ? 'primary' : 'default'}>
                                                    {post.type}
                                                </Badge>
                                            </div>
                                            <p style={{ marginBottom: '0.5rem' }}>{post.content}</p>
                                            {post.image && (
                                                <div style={{ marginBottom: '0.5rem' }}>
                                                    <img
                                                        src={getImageUrl(post.image)}
                                                        alt="Post content"
                                                        style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px', objectFit: 'cover' }}
                                                    />
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                                                <div style={{ cursor: 'pointer' }} onClick={() => handleLikePost(post._id)}>
                                                    <Heart size={14} /> {post.likes || 0}
                                                </div>
                                                <div style={{ cursor: 'pointer' }} onClick={() => setSelectedPostForComments(post)}>
                                                    <MessageSquare size={14} /> {post.comments?.length || 0}
                                                </div>
                                                <div style={{ cursor: 'pointer' }} onClick={() => handleSharePost(post._id)}>
                                                    <Share2 size={14} /> {post.shares || 0}
                                                </div>
                                                <div style={{ cursor: 'pointer', marginLeft: 'auto', color: 'red' }} onClick={() => handleDeletePost(post._id)}>
                                                    <Trash2 size={14} /> Delete
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No posts yet</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Events Tab - ✅ NOW WITH DEDICATED CREATE EVENT BUTTON */}
                        {detailTab === 'events' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ margin: 0 }}>Community Events</h4>
                                    <Button size="sm" onClick={() => setIsCreateEventOpen(true)}>
                                        <Calendar size={16} style={{ marginRight: '4px' }} /> Create Event
                                    </Button>
                                </div>
                                <div>
                                    {posts.filter(p => p.type === 'Event').length > 0 ? (
                                        posts.filter(p => p.type === 'Event').map((post) => (
                                            <div key={post._id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem', background: '#f8fafc' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{post.authorName}</div>
                                                    <Badge variant="primary">EVENT</Badge>
                                                </div>
                                                <p style={{ marginBottom: '1rem', color: '#334155', whiteSpace: 'pre-wrap' }}>{post.content}</p>
                                                {post.image && (
                                                    <img
                                                        src={getImageUrl(post.image)}
                                                        alt="Event"
                                                        style={{ width: '250px', maxHeight: '250px', objectFit: 'cover', borderRadius: '6px', marginBottom: '1rem' }}
                                                    />
                                                )}
                                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                                                    <div style={{ cursor: 'pointer' }} onClick={() => handleLikePost(post._id)}>
                                                        <Heart size={14} /> {post.likes || 0}
                                                    </div>
                                                    <div style={{ cursor: 'pointer' }} onClick={() => setSelectedPostForComments(post)}>
                                                        <MessageSquare size={14} /> {post.comments?.length || 0}
                                                    </div>
                                                    <div style={{ cursor: 'pointer', marginLeft: 'auto', color: 'red' }} onClick={() => handleDeletePost(post._id)}>
                                                        <Trash2 size={14} /> Delete
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                            <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                            <p>No events found for this community.</p>
                                            <p style={{ fontSize: '0.875rem' }}>Create your first event to get started!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Create Post Modal */}
            <Modal
                isOpen={isCreatePostOpen}
                onClose={() => setIsCreatePostOpen(false)}
                title="Create Post"
            >
                <div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Post Type</label>
                        <select
                            value={newPost.type}
                            onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                        >
                            <option value="Public">Public (Visible to all followers)</option>
                            <option value="Member">Member Only (Visible to members only)</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Content</label>
                        <textarea
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', minHeight: '100px' }}
                            placeholder="What's on your mind?"
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Image (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewPost({ ...newPost, image: e.target.files[0] })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Button variant="secondary" onClick={() => setIsCreatePostOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreatePost} disabled={!newPost.content.trim()}>
                            Post
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ✅ NEW: Create Event Modal */}
            <Modal
                isOpen={isCreateEventOpen}
                onClose={() => {
                    setIsCreateEventOpen(false);
                    setNewEvent({ 
                        title: '', 
                        description: '', 
                        eventDate: '', 
                        eventTime: '', 
                        location: '', 
                        image: null 
                    });
                }}
                title="Create Community Event"
            >
                <div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Event Title *
                        </label>
                        <input
                            type="text"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            placeholder="e.g., Annual Tech Conference 2026"
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Event Description *
                        </label>
                        <textarea
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', minHeight: '100px' }}
                            placeholder="Describe what the event is about..."
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Event Date *
                            </label>
                            <input
                                type="date"
                                value={newEvent.eventDate}
                                onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Event Time
                            </label>
                            <input
                                type="time"
                                value={newEvent.eventTime}
                                onChange={(e) => setNewEvent({ ...newEvent, eventTime: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Location
                        </label>
                        <input
                            type="text"
                            value={newEvent.location}
                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            placeholder="e.g., Convention Center, Downtown or Online"
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Event Image (Optional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewEvent({ ...newEvent, image: e.target.files[0] })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                        />
                        {newEvent.image && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                                Selected: {newEvent.image.name}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <Button 
                            variant="secondary" 
                            onClick={() => {
                                setIsCreateEventOpen(false);
                                setNewEvent({ 
                                    title: '', 
                                    description: '', 
                                    eventDate: '', 
                                    eventTime: '', 
                                    location: '', 
                                    image: null 
                                });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreateEvent} 
                            disabled={!newEvent.title.trim() || !newEvent.description.trim() || !newEvent.eventDate}
                        >
                            <Calendar size={16} style={{ marginRight: '4px' }} />
                            Create Event
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Community Modal */}
            <Modal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title="Edit Community"
            >
                {editingCommunity && (
                    <div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                            <input
                                type="text"
                                value={editingCommunity.name}
                                onChange={(e) => setEditingCommunity({ ...editingCommunity, name: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                            <textarea
                                value={editingCommunity.description}
                                onChange={(e) => setEditingCommunity({ ...editingCommunity, description: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', minHeight: '80px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Status</label>
                            <select
                                value={editingCommunity.status}
                                onChange={(e) => setEditingCommunity({ ...editingCommunity, status: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Active">Active</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateCommunity}>Save Changes</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Comments Moderation Modal */}
            <Modal
                isOpen={!!selectedPostForComments}
                onClose={() => setSelectedPostForComments(null)}
                title="Post Comments"
            >
                {selectedPostForComments && (
                    <div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem' }}>
                            {selectedPostForComments.comments?.length > 0 ? selectedPostForComments.comments.map((comment) => (
                                <div key={comment._id} style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{comment.userName}</div>
                                            <div style={{ fontSize: '0.875rem' }}>{comment.text}</div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteComment(selectedPostForComments._id, comment._id)}
                                            style={{ color: 'red' }}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>No comments yet</p>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setSelectedPostForComments(null)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}