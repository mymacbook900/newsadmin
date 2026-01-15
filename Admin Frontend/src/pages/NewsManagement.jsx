import { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Edit2, Trash2, Eye, CheckCircle, XCircle, Upload } from 'lucide-react';
import { getNewsAPI, createNewsAPI, updateNewsStatusAPI, deleteNewsAPI } from '../services/userApi';

export default function NewsManagement() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedArticle, setSelectedArticle] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newArticle, setNewArticle] = useState({ title: '', author: 'Admin', category: 'Local', content: '', image: null });

    const [filterStatus, setFilterStatus] = useState("All");
    const [filterCategory, setFilterCategory] = useState("All");

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const res = await getNewsAPI();
            setNews(res.data);
        } catch (error) {
            console.error("Fetch News Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (article) => {
        setSelectedArticle(article);
        setIsModalOpen(true);
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await updateNewsStatusAPI(id, newStatus);
            fetchNews();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Update Status Error:", error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this article?')) {
            try {
                await deleteNewsAPI(id);
                fetchNews();
            } catch (error) {
                console.error("Delete News Error:", error);
            }
        }
    };

    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            setNewArticle({ ...newArticle, image: e.target.files[0] });
        }
    };

    const handleCreate = async (status = 'Pending') => {
        if (!newArticle.title || !newArticle.content) {
            alert('Please fill in all fields');
            return;
        }

        try {
            let articleData = { ...newArticle, status };

            // Convert image to Base64 if it's a File
            if (newArticle.image instanceof File) {
                const base64Image = await convertToBase64(newArticle.image);
                articleData = { ...articleData, image: base64Image };
            }

            await createNewsAPI(articleData);
            setIsCreateModalOpen(false);
            setNewArticle({ title: '', author: 'Admin', category: 'Local', content: '', image: null });
            fetchNews();
        } catch (error) {
            console.error("Create News Error:", error);
            alert("Failed to create news. See console for details.");
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

    // Derived state for multiple filters
    const filteredArticles = news.filter(article => {
        const matchesStatus = filterStatus === "All" || article.status === filterStatus;
        const matchesCategory = filterCategory === "All" || article.category === filterCategory;
        return matchesStatus && matchesCategory;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Published': return 'success';
            case 'Rejected': return 'danger';
            case 'Pending': return 'warning';
            default: return 'default';
        }
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>News Management</h1>
                    <p className="text-secondary">Moderate and manage news articles</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }} className="hide-on-mobile">Filters:</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.875rem',
                            background: 'white',
                            cursor: 'pointer',
                            flex: '1',
                            minWidth: '140px'
                        }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Published">Published</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.875rem',
                            background: 'white',
                            cursor: 'pointer',
                            flex: '1',
                            minWidth: '140px'
                        }}
                    >
                        <option value="All">All Categories</option>
                        <option value="Local">Local</option>
                        <option value="Business">Business</option>
                        <option value="Lifestyle">Lifestyle</option>
                        <option value="Health">Health</option>
                        <option value="Sports">Sports</option>
                        <option value="Technology">Technology</option>
                        <option value="World">World</option>
                        <option value="Politics">Politics</option>
                        <option value="Entertainment">Entertainment</option>
                    </select>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>Create Article</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Article</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredArticles.length > 0 ? (
                        filteredArticles.map((item) => (
                            <TableRow key={item._id}>
                                <TableCell>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '48px', height: '32px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                            {item.image ? (
                                                <img
                                                    src={typeof item.image === 'string' ? item.image : URL.createObjectURL(item.image)}
                                                    alt="thumb"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '10px' }}>No Img</div>
                                            )}
                                        </div>
                                        <div style={{ fontWeight: 500 }}>{item.title}</div>
                                    </div>
                                </TableCell>
                                <TableCell>{item.author}</TableCell>
                                <TableCell><Badge variant="info">{item.category}</Badge></TableCell>
                                <TableCell>
                                    <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
                                </TableCell>
                                <TableCell>{item.date}</TableCell>
                                <TableCell>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)} title="Review">
                                            <Eye size={18} />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-danger" title="Delete" onClick={() => handleDelete(item._id)}>
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                    {loading ? 'Loading...' : `No articles found for status "${filterStatus}" and category "${filterCategory}"`}
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Review Article"
                size="lg"
            >
                {selectedArticle && (
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{selectedArticle.title}</h2>
                        <div style={{ display: 'flex', gap: '1rem', color: '#64748b', marginBottom: '1.5rem' }}>
                            <span>By {selectedArticle.author}</span>
                            <span>•</span>
                            <span>{new Date(selectedArticle.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <Badge variant="info">{selectedArticle.category}</Badge>
                        </div>

                        {selectedArticle.image && (
                            <div style={{ width: '100%', maxHeight: '300px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                                <img
                                    src={typeof selectedArticle.image === 'string' ? selectedArticle.image : URL.createObjectURL(selectedArticle.image)}
                                    alt="Article"
                                    style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'cover' }}
                                />
                            </div>
                        )}

                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', minHeight: '200px', marginBottom: '1.5rem' }}>
                            <p>{selectedArticle.content || "No content provided."}</p>
                        </div>

                        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <Button variant="danger" onClick={() => updateStatus(selectedArticle._id, 'Rejected')}>
                                <XCircle size={18} /> Reject
                            </Button>
                            <Button variant="primary" onClick={() => updateStatus(selectedArticle._id, 'Published')}>
                                <CheckCircle size={18} /> Publish
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Article"
                size="lg"
            >
                {/* Article Image Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{
                        width: '120px', height: '80px', borderRadius: '8px', backgroundColor: '#f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1',
                        overflow: 'hidden'
                    }}>
                        {newArticle.image ? (
                            <img
                                src={URL.createObjectURL(newArticle.image)}
                                alt="Preview"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <Upload size={32} color="#94a3b8" />
                        )}
                    </div>
                    <div>
                        <label className="button-secondary" style={{
                            padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer',
                            background: 'white', border: '1px solid #e2e8f0', fontSize: '0.875rem', display: 'inline-block'
                        }}>
                            Choose Cover Image
                            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                        </label>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                            Landscape orientation works best (e.g. 1200x800)
                        </div>
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                    <input
                        type="text"
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                        placeholder="Article Headline"
                        value={newArticle.title}
                        onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                    />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                    <select
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                        value={newArticle.category}
                        onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                    >
                        <option value="Local">Local</option>
                        <option value="Business">Business</option>
                        <option value="Lifestyle">Lifestyle</option>
                        <option value="World">World</option>
                    </select>
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Content</label>
                    <textarea
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', minHeight: '200px' }}
                        placeholder="Write your article content here..."
                        value={newArticle.content}
                        onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                    />
                </div>
                <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                    <Button variant="outline" onClick={() => handleCreate('Pending')}>Save as Draft</Button>
                    <Button onClick={() => handleCreate('Published')}>Publish Now</Button>
                </div>
            </Modal>
        </div>
    );
}
