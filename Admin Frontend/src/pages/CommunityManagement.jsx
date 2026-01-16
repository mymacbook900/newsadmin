import { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Plus, Users, Settings, MessageSquare, Heart, Share2, Eye, Check, X, Mail, UserPlus, Shield } from 'lucide-react';
import {
    getCommunitiesAPI, createCommunityAPI, deleteCommunityAPI,
    sendEmailVerificationAPI, verifyDomainEmailAPI,
    inviteAuthorizedPersonAPI, approveAuthorizedInviteAPI,
    approveJoinRequestAPI, rejectJoinRequestAPI,
    getCommunityPostsAPI, createPostAPI,
    likePostAPI, commentOnPostAPI, sharePostAPI,
    getUsersAPI
} from '../services/userApi';

export default function CommunityManagement() {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ type: 'all', status: 'all' });

    // Creation Wizard State
    const [wizardStep, setWizardStep] = useState(0);
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

    // Post State
    const [posts, setPosts] = useState([]);
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const [newPost, setNewPost] = useState({
        content: '',
        type: 'Public',
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
            // Use the specific API for community posts
            const res = await getCommunityPostsAPI(communityId);
            setPosts(res.data);
        } catch (error) {
            console.error('Fetch posts error:', error);
        }
    };

    // Wizard Handlers
    const handleCreateCommunity = async () => {
        try {
            const userDataStr = localStorage.getItem('adminUser');
            console.log('User Data String from localStorage:', userDataStr);

            const userData = userDataStr ? JSON.parse(userDataStr) : null;
            const creatorId = userData?._id || userData?.id; // Check both just in case

            if (!creatorId) {
                alert('No creator session found. Please log in again.');
                return;
            }

            const payload = {
                name: newCommunity.name,
                description: newCommunity.description,
                type: newCommunity.type,
                image: newCommunity.image,
                creatorId: creatorId
            };

            console.log('Sending Community Creation Payload:', payload);
            const res = await createCommunityAPI(payload);
            setCreatedCommunityId(res.data._id);

            if (newCommunity.type === 'Single') {
                setWizardStep(1); // Go to email verification
            } else {
                setWizardStep(2); // Go to invite authorized persons
            }
        } catch (error) {
            console.error('Create community error details:', error.response?.data || error.message);
            alert(`Failed to create community: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleSendEmailOTP = async () => {
        try {
            const res = await sendEmailVerificationAPI({
                communityId: createdCommunityId,
                domainEmail: newCommunity.domainEmail
            });
            setGeneratedOTP(res.data.otp); // For testing
            alert(`OTP sent to ${newCommunity.domainEmail}. OTP: ${res.data.otp}`);
        } catch (error) {
            console.error('Send OTP error:', error);
            alert('Failed to send OTP');
        }
    };

    const handleVerifyEmail = async () => {
        try {
            await verifyDomainEmailAPI({
                communityId: createdCommunityId,
                otp: otpInput
            });
            alert('Email verified! Community is now active.');
            closeWizard();
            fetchCommunities();
        } catch (error) {
            console.error('Verify email error:', error);
            alert('Invalid OTP or verification failed');
        }
    };

    const handleInviteAuthorized = async () => {
        try {
            const validEmails = newCommunity.authorizedEmails.filter(e => e.trim());
            if (validEmails.length < 2) {
                alert('Please add at least 2 authorized persons');
                return;
            }

            for (const email of validEmails) {
                await inviteAuthorizedPersonAPI(createdCommunityId, { email });
            }
            alert(`Invitations sent to ${validEmails.length} users. They will receive OTP via email.`);
            closeWizard();
            fetchCommunities();
        } catch (error) {
            console.error('Invite authorized error:', error);
            alert('Failed to send invitations');
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
    };

    // Community Actions
    const handleDeleteCommunity = async (id) => {
        if (confirm('Are you sure you want to delete this community?')) {
            try {
                await deleteCommunityAPI(id);
                fetchCommunities();
            } catch (error) {
                console.error('Delete error:', error);
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

            await createPostAPI({
                communityId: selectedCommunity._id,
                content: newPost.content,
                type: newPost.type,
                authorName: userData?.name || userData?.fullName,
                userId: userId
            });
            setIsCreatePostOpen(false);
            setNewPost({ content: '', type: 'Public', image: null });
            fetchPosts(selectedCommunity._id);
        } catch (error) {
            console.error('Create post error details:', error.response?.data || error.message);
            alert(`Failed to create post: ${error.response?.data?.message || error.message}`);
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
                            <TableCell>{community.membersCount || 0}</TableCell>
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
                                        onClick={() => handleDeleteCommunity(community._id)}
                                        style={{ color: 'red' }}
                                    >
                                        <X size={18} />
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

            {/* Creation Wizard Modal */}
            <Modal
                isOpen={isCreateOpen}
                onClose={closeWizard}
                title={wizardStep === 0 ? 'Create Community' : wizardStep === 1 ? 'Email Verification' : 'Invite Authorized Persons'}
            >
                {wizardStep === 0 && (
                    <div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Community Name</label>
                            <input
                                type="text"
                                value={newCommunity.name}
                                onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                placeholder="e.g., Tech Innovators"
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                            <textarea
                                value={newCommunity.description}
                                onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', minHeight: '80px' }}
                                placeholder="Describe your community..."
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Community Type</label>
                            <select
                                value={newCommunity.type}
                                onChange={(e) => setNewCommunity({ ...newCommunity, type: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            >
                                <option value="Single">Single Creator (Email Verification Required)</option>
                                <option value="Multi">Multi-User (Requires 2+ Authorized Persons)</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <Button variant="secondary" onClick={closeWizard}>Cancel</Button>
                            <Button onClick={handleCreateCommunity} disabled={!newCommunity.name.trim()}>
                                Next
                            </Button>
                        </div>
                    </div>
                )}

                {wizardStep === 1 && (
                    <div>
                        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#eff6ff', borderRadius: '4px' }}>
                            <Mail size={20} style={{ marginBottom: '0.5rem' }} />
                            <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                                Domain email verification is required for Single Creator communities.
                            </p>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Domain Email</label>
                            <input
                                type="email"
                                value={newCommunity.domainEmail}
                                onChange={(e) => setNewCommunity({ ...newCommunity, domainEmail: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                placeholder="admin@yourdomain.com"
                            />
                        </div>
                        <Button onClick={handleSendEmailOTP} disabled={!newCommunity.domainEmail.trim()} style={{ marginBottom: '1rem', width: '100%' }}>
                            Send OTP
                        </Button>
                        {generatedOTP && (
                            <div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Enter OTP</label>
                                    <input
                                        type="text"
                                        value={otpInput}
                                        onChange={(e) => setOtpInput(e.target.value)}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                        placeholder="Enter 6-digit OTP"
                                        maxLength={6}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <Button variant="secondary" onClick={closeWizard}>Cancel</Button>
                                    <Button onClick={handleVerifyEmail} disabled={otpInput.length !== 6}>
                                        Verify & Activate
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {wizardStep === 2 && (
                    <div>
                        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fef3c7', borderRadius: '4px' }}>
                            <UserPlus size={20} style={{ marginBottom: '0.5rem' }} />
                            <p style={{ fontSize: '0.875rem', color: '#92400e' }}>
                                Multi-User communities require at least 2 authorized persons to approve before activation.
                            </p>
                        </div>
                        {newCommunity.authorizedEmails.map((email, index) => (
                            <div key={index} style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Authorized Person {index + 1}</label>
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
                            onClick={() => setNewCommunity({ ...newCommunity, authorizedEmails: [...newCommunity.authorizedEmails, ''] })}
                            style={{ marginBottom: '1rem' }}
                        >
                            + Add Another Person
                        </Button>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <Button variant="secondary" onClick={closeWizard}>Cancel</Button>
                            <Button onClick={handleInviteAuthorized}>
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
                        <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                            {['overview', 'members', 'posts'].map((tab) => (
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
                            <div>
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
                                </div>
                                <div style={{ marginTop: '1rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Description</div>
                                    <p>{selectedCommunity.description || 'No description'}</p>
                                </div>
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
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {selectedCommunity.members?.map((memberId) => {
                                        const user = allUsers.find(u => u._id === memberId);
                                        return (
                                            <div key={memberId} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                                {user?.fullName || 'Unknown User'}
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
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {posts.length > 0 ? posts.map((post) => (
                                        <div key={post._id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <div style={{ fontWeight: 500 }}>{post.authorName}</div>
                                                <Badge variant={post.type === 'Public' ? 'success' : post.type === 'Member' ? 'primary' : 'default'}>
                                                    {post.type}
                                                </Badge>
                                            </div>
                                            <p style={{ marginBottom: '0.5rem' }}>{post.content}</p>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                                                <div style={{ cursor: 'pointer' }} onClick={() => handleLikePost(post._id)}>
                                                    <Heart size={14} /> {post.likes || 0}
                                                </div>
                                                <div style={{ cursor: 'pointer' }}>
                                                    <MessageSquare size={14} /> {post.comments?.length || 0}
                                                </div>
                                                <div style={{ cursor: 'pointer' }} onClick={() => handleSharePost(post._id)}>
                                                    <Share2 size={14} /> {post.shares || 0}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No posts yet</p>
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
                            <option value="Event">Event (Paid post)</option>
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Button variant="secondary" onClick={() => setIsCreatePostOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreatePost} disabled={!newPost.content.trim()}>
                            Post
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
