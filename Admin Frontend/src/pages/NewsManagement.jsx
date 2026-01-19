import { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Plus, Trash2, Eye, CheckCircle, XCircle, Upload, ThumbsUp, Share2, Globe, Clock, User, Link, Check, Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { getNewsAPI, createNewsAPI, updateNewsStatusAPI, deleteNewsAPI, likeNewsAPI, shareNewsAPI } from '../services/userApi';

export default function NewsManagement() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedArticle, setSelectedArticle] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newArticle, setNewArticle] = useState({ title: '', author: 'Admin', category: 'Local', content: '', image: null, isExternal: false, externalSource: '' });

    // Share Modal State
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareData, setShareData] = useState({ title: '', url: '' });
    const [copied, setCopied] = useState(false);

    // Filters
    const [filterVerification, setFilterVerification] = useState("All"); // All, Verified, Pending, Not Verified (External)
    const [filterCategory, setFilterCategory] = useState("All");

    useEffect(() => {
        fetchNews();
        console.log(news);
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

    // Interaction Handlers (For Demo/Testing purposes in Admin)
    const handleLike = async (id) => {
        // Optimistic UI Update
        if (selectedArticle && selectedArticle._id === id) {
            setSelectedArticle(prev => ({ ...prev, likes: prev.likes + 1 }));
        }

        try {
            await likeNewsAPI(id);
            fetchNews(); // Sync with server
        } catch (error) {
            console.error("Like Error:", error);
            // Revert optimistic update
            if (selectedArticle && selectedArticle._id === id) {
                setSelectedArticle(prev => ({ ...prev, likes: prev.likes - 1 }));
            }
            alert("Failed to like article. Please try again.");
        }
    };

    const handleShare = async (article) => {
        // Optimistic UI Update
        if (selectedArticle && selectedArticle._id === article._id) {
            setSelectedArticle(prev => ({ ...prev, shares: (prev.shares || 0) + 1 }));
        }

        try {
            await shareNewsAPI(article._id);
            fetchNews();

            // Generate share URL
            const baseUrl = window.location.origin; // e.g. http://localhost:5173
            const shareUrl = `${baseUrl}/story/${article._id}`;

            setShareData({ title: article.title, url: shareUrl });
            setIsShareModalOpen(true);
            setCopied(false);
        } catch (error) {
            console.error("Share Error:", error);
            // Revert optimistic update
            if (selectedArticle && selectedArticle._id === article._id) {
                setSelectedArticle(prev => ({ ...prev, shares: (prev.shares || 0) - 1 }));
            }
            alert("Failed to share article. Please try again.");
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
            setNewArticle({ title: '', author: 'Admin', category: 'Local', content: '', image: null, isExternal: false, externalSource: '' });
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

    // Filter Logic
    const filteredArticles = news.filter(article => {
        let matchesVerification = true;
        if (filterVerification === 'Verified') matchesVerification = article.isVerified === true;
        if (filterVerification === 'Pending') matchesVerification = article.status === 'Pending';
        if (filterVerification === 'Rejected') matchesVerification = article.status === 'Rejected';
        if (filterVerification === 'External') matchesVerification = article.isExternal === true;

        const matchesCategory = filterCategory === "All" || article.category === filterCategory;
        return matchesVerification && matchesCategory;
    });

    const getStatusVariant = (article) => {
        if (article.status === 'Rejected') return 'danger';
        if (article.isVerified) return 'success'; // Verified & Published
        if (article.isExternal) return 'info'; // External usually 'Not Verified' but distinct
        if (article.status === 'Pending') return 'warning';
        return 'default';
    };

    const getStatusLabel = (article) => {
        if (article.status === 'Rejected') return 'Rejected';
        if (article.isVerified) return 'Verified';
        if (article.isExternal) return 'External';
        return article.status; // Pending or Published (unverified)
    };


    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                    <h1>News Management</h1>
                    <p className="text-secondary">Track, verify, and manage news articles</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', flexDirection: 'row' }}>
                    <div><select
                        value={filterVerification}
                        onChange={(e) => setFilterVerification(e.target.value)}
                        className="form-select"
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                    >
                        <option value="All">All News</option>
                        <option value="Verified">Verified (Published)</option>
                        <option value="Pending">Pending Approval</option>
                        <option value="External">External (Not Verified)</option>
                        <option value="Rejected">Rejected</option>
                    </select></div>
                    <div><select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="form-select"
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}
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
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}><Plus className="w-4 h-4 mr-2" style={{ width: '16px', marginRight: '8px' }} /> Create Article</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Article</TableHead>
                        <TableHead>Source</TableHead>
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
                                        <div style={{ fontWeight: 500, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.title}>{item.title}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {item.isExternal ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '12px' }}><Globe size={12} /> {item.externalSource || "External"}</span>
                                    ) : (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> {item.authorName || "Reporter"}</span>
                                    )}
                                </TableCell>
                                <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(item)}>{getStatusLabel(item)}</Badge>
                                </TableCell>
                                <TableCell><span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(item.date).toLocaleDateString()}</span></TableCell>
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
                            <TableCell colSpan={7}>
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                    {loading ? 'Loading...' : `No articles found.`}
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* DETAILS & VERIFY MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedArticle?.status === 'Pending' ? "Verify Article" : "Article Details"}
                size="lg"
            >
                {selectedArticle && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <Badge variant={getStatusVariant(selectedArticle)}>{getStatusLabel(selectedArticle)}</Badge>
                            <span style={{ color: '#64748b', fontSize: '12px' }}>{new Date(selectedArticle.date).toLocaleString()}</span>
                        </div>

                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{selectedArticle.title}</h2>
                        <div style={{ display: 'flex', gap: '1rem', color: '#64748b', marginBottom: '1.5rem', fontSize: '14px' }}>
                            <span>By {selectedArticle.authorName || "Unknown"}</span>
                            <span>•</span>
                            <Badge variant="outline">{selectedArticle.category}</Badge>
                            {selectedArticle.isExternal && <span>• via {selectedArticle.externalSource || 'External API'}</span>}
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

                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', minHeight: '150px', marginBottom: '1.5rem' }}>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{selectedArticle.content || "No content provided."}</p>
                        </div>

                        {/* Interaction Bar */}
                        <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem', background: '#f1f5f9', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <Button size="sm" variant="ghost" onClick={() => handleLike(selectedArticle._id)}>
                                <ThumbsUp size={16} style={{ marginRight: 5 }} /> {selectedArticle.likes} Likes
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleShare(selectedArticle)}>
                                <Share2 size={16} style={{ marginRight: 5 }} /> {selectedArticle.shares} Shares
                            </Button>
                            <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', color: '#64748b', fontSize: '14px' }}>
                                <Eye size={16} style={{ marginRight: 5 }} /> {selectedArticle.views} Views
                            </div>
                        </div>

                        {/* Admin Action Bar */}
                        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                            {selectedArticle.status === 'Pending' && (
                                <>
                                    <Button variant="danger" onClick={() => updateStatus(selectedArticle._id, 'Rejected')}>
                                        <XCircle size={18} style={{ marginRight: 5 }} /> Reject
                                    </Button>
                                    <Button variant="success" onClick={() => updateStatus(selectedArticle._id, 'Published')}>
                                        <CheckCircle size={18} style={{ marginRight: 5 }} /> Verify & Publish
                                    </Button>
                                </>
                            )}
                            {selectedArticle.status === 'Published' && (
                                <Button variant="secondary" disabled>
                                    <CheckCircle size={18} style={{ marginRight: 5 }} /> Verified
                                </Button>
                            )}
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* CREATE MODAL */}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
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
                            <option value="Politics">Politics</option>
                            <option value="Sports">Sports</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Source Type</label>
                        <select
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            value={newArticle.isExternal ? 'External' : 'Internal'}
                            onChange={(e) => setNewArticle({ ...newArticle, isExternal: e.target.value === 'External' })}
                        >
                            <option value="Internal">Internal (Admin/Reporter)</option>
                            <option value="External">External API/Source</option>
                        </select>
                    </div>
                </div>

                {newArticle.isExternal && (
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>External Source Name</label>
                        <input
                            type="text"
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            placeholder="e.g. BBC, CNN"
                            value={newArticle.externalSource}
                            onChange={(e) => setNewArticle({ ...newArticle, externalSource: e.target.value })}
                        />
                    </div>
                )}

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

            {/* SHARE MODAL */}
            <Modal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title="Share this Article"
                size="md"
            >
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Share "<b>{shareData.title}</b>" with your network</p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(shareData.title + ' ' + shareData.url)}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#25d366' }}
                        >
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#25d366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MessageCircle size={24} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 500 }}>WhatsApp</span>
                        </a>

                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#1877f2' }}
                        >
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#1877f2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Facebook size={24} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 500 }}>Facebook</span>
                        </a>

                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#000000' }}
                        >
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#000000', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Twitter size={24} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 500 }}>X / Twitter</span>
                        </a>

                        <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#0a66c2' }}
                        >
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#0a66c2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Linkedin size={24} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 500 }}>LinkedIn</span>
                        </a>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            readOnly
                            value={shareData.url}
                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: '#475569' }}
                        />
                        <Button
                            size="sm"
                            variant={copied ? "success" : "secondary"}
                            onClick={() => {
                                navigator.clipboard.writeText(shareData.url);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                        >
                            {copied ? <Check size={16} /> : <Link size={16} />}
                            {copied ? "Copied" : "Copy"}
                        </Button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <Button variant="secondary" onClick={() => setIsShareModalOpen(false)}>Close</Button>
                </div>
            </Modal>
        </div>
    );
}
