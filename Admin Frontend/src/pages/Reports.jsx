import { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import {
    BarChart3,
    Eye,
    Heart,
    Share2,
    Save,
    Bookmark,
    Flag,
    AlertTriangle,
    MessageSquare,
    XCircle,
    Download,
    TrendingUp,
    TrendingDown,
    FileText
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import './Reports.css';
import { getReportsAPI, updateReportStatusAPI, getReportsAnalyticsAPI } from '../services/userApi';

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('analytics');
    const [analyticsData, setAnalyticsData] = useState({
        engagementTrends: [],
        typeMetrics: [],
        totals: {}
    });

    useEffect(() => {
        if (activeTab === 'moderation') {
            fetchReports();
        } else {
            fetchAnalytics();
        }
    }, [activeTab]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await getReportsAnalyticsAPI();
            setAnalyticsData(res.data);
        } catch (error) {
            console.error("Fetch Reports Analytics Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await getReportsAPI();
            setReports(res.data);
        } catch (error) {
            console.error("Fetch Reports Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'High': return 'danger';
            case 'Medium': return 'warning';
            case 'Low': return 'info';
            default: return 'default';
        }
    };

    const handleReview = (report) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    const handleAction = async (id, action) => {
        try {
            const status = action === 'dismiss' ? 'Dismissed' : 'Resolved';
            await updateReportStatusAPI(id, status);
            fetchReports();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Update Report Error:", error);
        }
    };

    return (
        <div className="reports-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Insights & Moderation</h1>
                    <p className="text-secondary">Monitor platform performance and content health</p>
                </div>
                <div className="export-group">
                    <Button variant="ghost" size="sm">
                        <Download size={16} style={{ marginRight: '8px' }} />
                        Export PDF
                    </Button>
                    <Button variant="primary" size="sm">
                        <Download size={16} style={{ marginRight: '8px' }} />
                        CSV Export
                    </Button>
                </div>
            </div>

            <div className="reports-tabs">
                <button
                    className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    <BarChart3 size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                    Analytics Overview
                </button>

            </div>


            <div className="analytics-content">
                <div className="analytics-grid">
                    <div className="analytics-card glass-panel">
                        <div className="meta">
                            <span className="title">Total Views</span>
                            <div className="trend trend-up"><Eye size={14} /> Global</div>
                        </div>
                        <div className="value">{analyticsData.totals?.totalViews?.toLocaleString() || 0}</div>
                        <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-500)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', marginTop: '8px' }}>
                            <BarChart3 size={18} />
                        </div>
                    </div>
                    <div className="analytics-card glass-panel">
                        <div className="meta">
                            <span className="title">Total Engagement</span>
                            <div className="trend trend-up"><Heart size={14} /> {((analyticsData.totals?.totalLikes + analyticsData.totals?.totalComments) || 0).toLocaleString()}</div>
                        </div>
                        <div className="value">{((analyticsData.totals?.totalLikes + analyticsData.totals?.totalComments + analyticsData.totals?.totalShares) || 0).toLocaleString()}</div>
                        <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', marginTop: '8px' }}>
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <div className="analytics-card glass-panel">
                        <div className="meta">
                            <span className="title">Bookmarked Items</span>
                            <div className="trend trend-up"><Bookmark size={14} /> +0</div>
                        </div>
                        <div className="value">{analyticsData.totals?.totalSaves?.toLocaleString() || 0}</div>
                        <div className="stat-icon" style={{ background: '#fef9c3', color: '#ca8a04', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', marginTop: '8px' }}>
                            <Save size={18} />
                        </div>
                    </div>
                </div>

                <div className="charts-section">
                    <div className="chart-box glass-panel">
                        <h3>Platform Engagement (Views vs Interactions)</h3>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={analyticsData.engagementTrends}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)', padding: '12px' }}
                                />
                                <Area type="monotone" dataKey="views" name="Page Views" stroke="var(--primary-500)" fillOpacity={1} fill="url(#colorViews)" strokeWidth={3} />
                                <Area type="monotone" dataKey="likes" name="Likes" stroke="#ef4444" fillOpacity={0} strokeWidth={2} />
                                <Area type="monotone" dataKey="comments" name="Comments" stroke="#8b5cf6" fillOpacity={0} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="chart-box glass-panel">
                        <h3>Content Performance (by Type)</h3>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={analyticsData.typeMetrics}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }} />
                                <Bar dataKey="Views" fill="var(--primary-400)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Likes" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Comments" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Shares" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Saves" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>


            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Review Report Details"
            >
                {selectedReport && (
                    <div>
                        <div className="form-group">
                            <label className="form-label">Report Type</label>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedReport.type}</div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Reported Content</label>
                            <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '0.5rem' }}>
                                "{selectedReport.targetContent}"
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Reporter Notes</label>
                            <p style={{ color: '#64748b' }}>User {selectedReport.reporter} flagged this as {selectedReport.severity} severity.</p>
                        </div>

                        <div className="form-actions">
                            <Button variant="ghost" onClick={() => handleAction(selectedReport._id, 'dismiss')}>
                                <XCircle size={18} style={{ marginRight: '8px' }} />
                                Dismiss Report
                            </Button>
                            <Button variant="danger" onClick={() => handleAction(selectedReport._id, 'ban')}>
                                <AlertTriangle size={18} style={{ marginRight: '8px' }} />
                                Take Action (Ban/Delete)
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
