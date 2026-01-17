import { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Bookmark, ExternalLink, Trash2, Newspaper, FileText, Calendar, BookOpen } from 'lucide-react';
import { getSavedContentAPI, saveContentAPI } from '../services/userApi';

export default function SavedContent() {
    const [savedItems, setSavedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSavedContent();
    }, []);

    const fetchSavedContent = async () => {
        try {
            setLoading(true);
            const res = await getSavedContentAPI();
            setSavedItems(res.data || []);
        } catch (error) {
            console.error("Fetch Saved Content Error:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUnsave = async (itemId, model) => {
        if (!window.confirm("Remove this from saved?")) return;
        try {
            await saveContentAPI({ itemId, itemModel: model });
            setSavedItems(prev => prev.filter(item => item.item._id !== itemId));
        } catch (error) {
            console.error("Unsave Error:", error);
        }
    };

    const getModelIcon = (model) => {
        switch (model) {
            case 'News': return <Newspaper size={18} className="text-blue-500" />;
            case 'Post': return <FileText size={18} className="text-green-500" />;
            case 'Event': return <Calendar size={18} className="text-purple-500" />;
            case 'CaseStudy': return <BookOpen size={18} className="text-indigo-500" />;
            default: return <Bookmark size={18} className="text-slate-500" />;
        }
    };

    return (
        <div className="p-6">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Bookmark size={28} className="text-primary fill-primary" /> Saved Content
                </h1>
                <p className="text-secondary">Quick access to items you've bookmarked</p>
            </div>

            <div className="card" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Saved Date</TableHead>
                            <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div style={{ color: '#64748b' }}>Loading your bookmarks...</div>
                                </TableCell>
                            </TableRow>
                        ) : savedItems.length > 0 ? savedItems.map((item) => (
                            <TableRow key={item._id}>
                                <TableCell>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                            {getModelIcon(item.itemModel)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.item?.title || item.item?.name || item.item?.content?.substring(0, 40) || 'Deleted Content'}</div>
                                            {item.item?.authorName && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>by {item.item.authorName}</div>}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                        {item.itemModel}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        {new Date(item.savedAt).toLocaleDateString()}
                                    </div>
                                </TableCell>
                                <TableCell style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                        <Button variant="ghost" size="sm" title="View Content">
                                            <ExternalLink size={18} className="text-slate-400" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleUnsave(item.item._id, item.itemModel)} title="Remove Bookmark">
                                            <Trash2 size={18} className="text-red-400" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} style={{ textAlign: 'center', padding: '4rem' }}>
                                    <div style={{ color: '#94a3b8' }}>
                                        <Bookmark size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                                        <p>You haven't saved any content yet.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
