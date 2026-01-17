import { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { Activity, Calendar, Clock, Eye, MessageSquare, Heart, Share2, Save } from 'lucide-react';
import { getMyActivityAPI } from '../services/userApi';

export default function MyActivity() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyActivity();
    }, []);

    const fetchMyActivity = async () => {
        try {
            setLoading(true);
            const res = await getMyActivityAPI();
            setActivities(res.data);
        } catch (error) {
            console.error("Fetch Activity Error:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'View': return <Eye size={16} className="text-blue-500" />;
            case 'Like': return <Heart size={16} className="text-red-500" />;
            case 'Share': return <Share2 size={16} className="text-green-500" />;
            case 'Comment': return <MessageSquare size={16} className="text-purple-500" />;
            case 'Save': return <Save size={16} className="text-orange-500" />;
            default: return <Activity size={16} className="text-slate-500" />;
        }
    };

    return (
        <div className="p-6">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Activity size={28} className="text-primary" /> My Activity
                </h1>
                <p className="text-secondary">Your recent history and interactions on the platform</p>
            </div>

            <div className="card" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Activity</TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div style={{ color: '#64748b' }}>Loading your activity history...</div>
                                </TableCell>
                            </TableRow>
                        ) : activities.length > 0 ? activities.map((log) => (
                            <TableRow key={log._id}>
                                <TableCell>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                            {getActionIcon(log.action)}
                                        </div>
                                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{log.action}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700 }}>
                                        {log.targetModel}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div style={{ color: '#334155', fontSize: '0.925rem' }}>{log.details || 'No details available'}</div>
                                    {log.targetId && (
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                                            Source: {log.targetId.title || log.targetId.name || log.targetId.content?.substring(0, 30) || 'N/A'}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>{new Date(log.timestamp).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} style={{ textAlign: 'center', padding: '4rem' }}>
                                    <div style={{ color: '#94a3b8' }}>
                                        <Activity size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                                        <p>No activity recorded yet.</p>
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
