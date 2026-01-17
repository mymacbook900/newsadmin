import { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { getMyNewsAPI, getReporterStatsAPI } from '../services/userApi';
import { Newspaper, TrendingUp, Award, Eye, Heart, Share2 } from 'lucide-react';

export default function ReportingHub() {
    const [news, setNews] = useState([]);
    const [stats, setStats] = useState({ currentBalance: 0, totalEarned: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [newsRes, statsRes] = await Promise.all([
                getMyNewsAPI(),
                getReporterStatsAPI()
            ]);
            setNews(newsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error("Fetch Reporting Hub Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Published': return 'success';
            case 'Rejected': return 'danger';
            case 'Pending': return 'warning';
            default: return 'default';
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Hub...</div>;

    return (
        <div className="p-6">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h1>Reporting Hub</h1>
                <p className="text-secondary">Manage your news and track your interaction earnings</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Current Balance</div>
                        <div style={{ padding: '0.5rem', background: '#ecfdf5', borderRadius: '8px', color: '#10b981' }}>
                            <Award size={20} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>₹{(stats?.currentBalance || 0).toFixed(2)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem' }}>Available for payout</div>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Lifetime Earnings</div>
                        <div style={{ padding: '0.5rem', background: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}>
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>₹{(stats?.totalEarned || 0).toFixed(2)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.5rem' }}>Total earned till date</div>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Total Articles</div>
                        <div style={{ padding: '0.5rem', background: '#fef3c7', borderRadius: '8px', color: '#f59e0b' }}>
                            <Newspaper size={20} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{news.length}</div>
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem' }}>Submitted news pieces</div>
                </div>
            </div>

            {/* News List */}
            <div className="card" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>My News Submissions</div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>News Details</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Interactions</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {news.length > 0 ? news.map((item) => (
                            <TableRow key={item._id}>
                                <TableCell>
                                    <div style={{ fontWeight: 500, color: '#1e293b' }}>{item.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {item._id}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{item.category}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div style={{ display: 'flex', gap: '1rem', color: '#64748b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Eye size={14} /> {item.views || 0}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Heart size={14} /> {item.likes || 0}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Share2 size={14} /> {item.shares || 0}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div style={{ fontSize: '0.875rem' }}>{new Date(item.createdAt).toLocaleDateString()}</div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                    You haven't submitted any news yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
