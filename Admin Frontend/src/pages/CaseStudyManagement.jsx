import { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Eye, Trash2, Upload, Plus } from 'lucide-react';
import { getCaseStudiesAPI, createCaseStudyAPI, deleteCaseStudyAPI } from '../services/userApi';

export default function CaseStudyManagement() {
    const [caseStudies, setCaseStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCaseStudy, setNewCaseStudy] = useState({ title: '', content: '', image: null });

    useEffect(() => {
        fetchCaseStudies();
    }, []);

    const fetchCaseStudies = async () => {
        try {
            setLoading(true);
            const res = await getCaseStudiesAPI();
            setCaseStudies(res.data);
        } catch (error) {
            console.error("Fetch Case Studies Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (_id) => {
        if (confirm('Are you sure you want to delete this case study?')) {
            try {
                await deleteCaseStudyAPI(_id);
                fetchCaseStudies();
            } catch (error) {
                console.error("Delete Case Study Error:", error);
            }
        }
    };

    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            setNewCaseStudy({ ...newCaseStudy, image: e.target.files[0] });
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    const handleCreate = async () => {
        if (!newCaseStudy.title || !newCaseStudy.content) {
            alert('Please fill in title and content');
            return;
        }

        try {
            let data = { ...newCaseStudy };

            // 1. Try to get ID from adminUser object
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

            if (user._id) {
                data.author = user._id;
            } else {
                // 2. Fallback: Try to decode ID from token
                const token = localStorage.getItem('token');
                if (token) {
                    const decoded = parseJwt(token);
                    if (decoded && decoded.id) {
                        data.author = decoded.id;
                    }
                }
            }

            if (!data.author) {
                alert("Session invalid. Please Logout and Login again to refresh your credentials.");
                return;
            }

            if (newCaseStudy.image instanceof File) {
                const base64Image = await convertToBase64(newCaseStudy.image);
                data.image = base64Image;
            }

            await createCaseStudyAPI(data);
            setIsCreateModalOpen(false);
            setNewCaseStudy({ title: '', content: '', image: null });
            fetchCaseStudies();
        } catch (error) {
            console.error("Create Case Study Error:", error);
            alert("Failed to create case study. please check console for details");
        }
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Case Studies</h1>
                    <p className="text-secondary">Manage informative case studies</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '4px' }} /> Create New
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Likes</TableHead>
                        <TableHead>Comments</TableHead>
                        <TableHead>Shares</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {caseStudies.length > 0 ? caseStudies.map((item) => (
                        <TableRow key={item._id}>
                            <TableCell>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {item.image && (
                                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden' }}>
                                            <img src={item.image} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <span style={{ fontWeight: 500 }}>{item.title}</span>
                                </div>
                            </TableCell>
                            <TableCell>{item.author?.fullName || 'Admin'}</TableCell>
                            <TableCell>{item.viewsCount}</TableCell>
                            <TableCell>{item.likesCount}</TableCell>
                            <TableCell>{item.commentsCount}</TableCell>
                            <TableCell>{item.sharesCount}</TableCell>
                            <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="sm" className="text-danger" onClick={() => handleDelete(item._id)}>
                                    <Trash2 size={18} />
                                </Button>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                                {loading ? 'Loading...' : 'No case studies found.'}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create Case Study"
                size="lg"
            >
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '100%', height: '150px', background: '#f1f5f9', borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1',
                        marginBottom: '1rem', overflow: 'hidden'
                    }}>
                        {newCaseStudy.image ? (
                            <img src={URL.createObjectURL(newCaseStudy.image)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                <Upload size={32} style={{ margin: '0 auto 0.5rem' }} />
                                <p>Click to upload cover image</p>
                            </div>
                        )}
                        <input type="file" style={{ position: 'absolute', opacity: 0, width: '100%', height: '150px', cursor: 'pointer' }} onChange={handleImageUpload} accept="image/*" />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                        type="text" className="form-control"
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                        value={newCaseStudy.title}
                        onChange={(e) => setNewCaseStudy({ ...newCaseStudy, title: e.target.value })}
                    />
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Content</label>
                    <textarea
                        className="form-control"
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', minHeight: '150px' }}
                        value={newCaseStudy.content}
                        onChange={(e) => setNewCaseStudy({ ...newCaseStudy, content: e.target.value })}
                    />
                </div>

                <div className="form-actions" style={{ marginTop: '1.5rem', display: 'flex', justifySelf: 'end', gap: '1rem' }}>
                    <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleCreate}>Create Case Study</Button>
                </div>
            </Modal>
        </div>
    );
}
