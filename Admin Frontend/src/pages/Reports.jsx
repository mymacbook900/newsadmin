import { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import {
    Flag,
    AlertTriangle,
    MessageSquare,
    CheckCircle,
    XCircle,
    Download,
    TrendingUp,
    TrendingDown,
    Users,
    FileText,
    BarChart3
} from 'lucide-react';
import {
    LineChart,
    Line,
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
        categoryDistribution: []
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
                    <h1>Reports & Analytics</h1>
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
                <button
                    className={`tab-btn ${activeTab === 'moderation' ? 'active' : ''}`}
                    onClick={() => setActiveTab('moderation')}
                >
                    <Flag size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                    Moderation Queue
                </button>
            </div>

            {activeTab === 'analytics' ? (
                <div className="analytics-content">
                    <div className="analytics-grid">
                        <div className="analytics-card glass-panel">
                            <div className="meta">
                                <span className="title">Total Revenue</span>
                                <div className="trend trend-up"><TrendingUp size={14} /> +12.5%</div>
                            </div>
                            <div className="value">$42,394</div>
                            <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-500)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', marginTop: '8px' }}>
                                <TrendingUp size={18} />
                            </div>
                        </div>
                        <div className="analytics-card glass-panel">
                            <div className="meta">
                                <span className="title">New Users</span>
                                <div className="trend trend-up"><TrendingUp size={14} /> +8.2%</div>
                            </div>
                            <div className="value">2,482</div>
                            <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', marginTop: '8px' }}>
                                <Users size={18} />
                            </div>
                        </div>
                        <div className="analytics-card glass-panel">
                            <div className="meta">
                                <span className="title">Articles Published</span>
                                <div className="trend trend-down"><TrendingDown size={14} /> -2.4%</div>
                            </div>
                            <div className="value">148</div>
                            <div className="stat-icon" style={{ background: '#fef9c3', color: '#ca8a04', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', marginTop: '8px' }}>
                                <FileText size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="charts-section">
                        <div className="chart-box glass-panel">
                            <h3>Engagement Trends</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analyticsData.engagementTrends}>
                                    <defs>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                                    />
                                    <Area type="monotone" dataKey="likes" stroke="var(--primary-500)" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="posts" stroke="#10b981" fillOpacity={0} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="chart-box glass-panel">
                            <h3>Top Categories</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analyticsData.categoryDistribution} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" fill="var(--primary-400)" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="moderation-content">
                    <div className="moderation-header">
                        <h2>Pending Reviews</h2>
                        <Badge variant="warning">{reports.filter(r => r.status === 'Pending').length} Pending</Badge>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Target Content</TableHead>
                                <TableHead>Reported By</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.length > 0 ? reports.map((report) => (
                                <TableRow key={report._id}>
                                    <TableCell>
                                        <div style={{ fontWeight: 500 }}>{report.type}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MessageSquare size={14} color="#94a3b8" />
                                            {report.targetContent}
                                        </div>
                                    </TableCell>
                                    <TableCell>{report.reporter}</TableCell>
                                    <TableCell>
                                        <Badge variant={getSeverityColor(report.severity)}>{report.severity}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={report.status === 'Resolved' ? 'success' : report.status === 'Dismissed' ? 'default' : 'warning'}>
                                            {report.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="primary" size="sm" onClick={() => handleReview(report)}>Review</Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                                        {loading ? 'Loading...' : 'No reports pending review.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

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

