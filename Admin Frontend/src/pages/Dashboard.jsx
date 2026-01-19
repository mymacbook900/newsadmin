import { useState, useMemo, useEffect } from 'react';
import {
    Users,
    Newspaper,
    UserCheck,
    Activity,
    Clock,
    AlertCircle,
    CheckCircle2,
    PlusCircle,
    Settings,
    FileText,
    TrendingUp,
    MessageSquare,
    Eye,
    ThumbsUp,
    XCircle,
    Calendar,
    Filter,
    BookOpen
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    ScatterChart,
    Scatter,
    ZAxis,
    Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import './Dashboard.css';

const INITIAL_STATS = [
    { label: 'Total News', value: '0', change: '+0%', icon: Newspaper, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Pending News', value: '0', change: '+0', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Published News', value: '0', change: '+0%', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Reported News', value: '0', change: '+0', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Total Users', value: '0', change: '+0%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Reporters', value: '0', change: '+0', icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Case Studies', value: '0', change: '+0', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-100' },
];

const COLORS = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
];

import { getDashboardStatsAPI, updateNewsStatusAPI, getDashboardAnalyticsAPI } from '../services/userApi';

export default function Dashboard() {
    const navigate = useNavigate();
    const [pendingNews, setPendingNews] = useState([]);
    const [popularNews, setPopularNews] = useState([]);
    const [stats, setStats] = useState(INITIAL_STATS);
    const [loading, setLoading] = useState(true);
    const [timeFrame, setTimeFrame] = useState('Week');
    const [analyticsData, setAnalyticsData] = useState(null);

    const activeData = useMemo(() => {
        // If API data is available, use it
        if (analyticsData) return analyticsData;

        // Return empty structure instead of mocks to avoid confusion
        return {
            wave: [],
            bar: [],
            pie: [],
            dot: []
        };
    }, [analyticsData]);

    useEffect(() => {
        fetchDashboardData();
        fetchAnalytics();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await getDashboardStatsAPI();
            setStats(res.data.stats.map(s => {
                const original = INITIAL_STATS.find(i => i.label === s.label);
                return {
                    ...original,
                    ...s,
                    icon: original.icon, // Preserve the component from INITIAL_STATS
                    value: s.value.toLocaleString()
                };
            }));
            setPendingNews(res.data.pendingNews);
            setPopularNews(res.data.popularNews || []);
        } catch (error) {
            console.error("Fetch Dashboard Error:", error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await getDashboardAnalyticsAPI();
            setAnalyticsData(res.data);
        } catch (error) {
            console.error("Fetch Analytics Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            const status = action === 'approve' ? 'Published' : 'Rejected';
            await updateNewsStatusAPI(id, status);
            fetchDashboardData();
            alert(`Succesfully ${status} article.`);
        } catch (error) {
            console.error("Update Status Error:", error);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Dashboard</h1>
                    <p className="text-secondary">System Overview & Quick Controls</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="time-filter glass-panel">
                        {['Today', 'Week', 'Month'].map(t => (
                            <button
                                key={t}
                                className={clsx('filter-btn', { active: timeFrame === t })}
                                onClick={() => setTimeFrame(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <div className="admin-status glass-panel" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        <div style={{ fontWeight: 600 }}>Admin: {JSON.parse(localStorage.getItem('adminUser'))?.name || 'Admin'}</div>
                        <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem' }}>Last Login: Recently</div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card glass-panel">
                        <div className="stat-content">
                            <div>
                                <p className="stat-label">{stat.label}</p>
                                <h3 className="stat-value">{stat.value}</h3>
                            </div>
                            <div className={clsx('stat-icon', stat.bg, stat.color)}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <div className="stat-footer">
                            <span className={clsx('stat-change', stat.color)}>{stat.change}</span>
                            <span className="text-secondary text-sm">{timeFrame.toLowerCase()}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Interactive Analytics Hub (New Section) */}
            <div className="analytics-hub glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <div className="hub-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Interactive Analytics Hub</h2>
                        <p className="text-secondary">Full visual breakdown of platform performance</p>
                    </div>
                    <TrendingUp size={24} color="var(--primary-500)" />
                </div>

                <div className="hub-grid">
                    {/* 1. Wave Graph (Area) */}
                    <div className="hub-card">
                        <div className="chart-header">
                            <h3>Traffic Trends (Wave)</h3>
                            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Active Sessions</span>
                        </div>
                        <div style={{ height: '220px', minHeight: '220px', minWidth: '0', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activeData.wave}>
                                    <defs>
                                        <linearGradient id="waveColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={30} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="val" stroke="var(--primary-500)" fillOpacity={1} fill="url(#waveColor)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. Bar Graph */}
                    <div className="hub-card">
                        <div className="chart-header">
                            <h3>News Distribution (Bar)</h3>
                            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>By Category</span>
                        </div>
                        <div style={{ height: '220px', minHeight: '220px', minWidth: '0', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activeData.bar}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={30} />
                                    <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                    <Bar dataKey="val" fill="var(--primary-400)" radius={[4, 4, 0, 0]} barSize={25} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. Pie Graph */}
                    <div className="hub-card">
                        <div className="chart-header">
                            <h3>Category Split (Pie)</h3>
                            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Market Share</span>
                        </div>
                        <div style={{ height: '220px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flex: 1, minHeight: '150px', height: '150px', width: '100%', minWidth: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={activeData.pie}
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {activeData.pie.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Custom Scrollable Legend */}
                            <div className="custom-legend-container">
                                <div className="scroll-legend">
                                    {activeData.pie.map((entry, index) => (
                                        <div key={index} className="legend-item">
                                            <span className="legend-box" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                            <span className="legend-label">{entry.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Dot Graph (Scatter) */}
                    <div className="hub-card">
                        <div className="chart-header">
                            <h3>Engagement Depth (Dot)</h3>
                            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>User Retention</span>
                        </div>
                        <div style={{ height: '220px', minHeight: '220px', minWidth: '0', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis type="number" dataKey="x" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <YAxis type="number" dataKey="y" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={30} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                    <Scatter name="Engagement" data={activeData.dot} fill="#10b981">
                                        {activeData.dot.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-main-grid">
                {/* Left Column: Charts and Activities */}
                <div className="dashboard-left">
                    <div className="content-card glass-panel">
                        <div className="card-header">
                            <h3>Pending Approvals</h3>
                            <button className="text-link" onClick={() => navigate('/news')}>View All</button>
                        </div>
                        <div className="table-responsive">
                            <table className="summary-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Author</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingNews.length > 0 ? (
                                        pendingNews.map(news => (
                                            <tr key={news._id}>
                                                <td className="title-cell">{news.title}</td>
                                                <td>{news.author}</td>
                                                <td>{new Date(news.date).toLocaleDateString()}</td>
                                                <td>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        <button
                                                            className="btn-approve"
                                                            title="Approve"
                                                            onClick={() => handleAction(news._id, 'approve')}
                                                        >
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                        <button
                                                            className="btn-reject"
                                                            title="Reject"
                                                            onClick={() => handleAction(news._id, 'reject')}
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                                                No pending approvals
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Quick Actions & Feeds */}
                <div className="dashboard-right">
                    <div className="content-card glass-panel" style={{ marginBottom: '1.5rem' }}>
                        <h3>Quick Actions</h3>
                        <div className="quick-actions-grid">
                            <button className="action-btn" onClick={() => navigate('/news')}>
                                <PlusCircle size={20} />
                                <span>Add News</span>
                            </button>
                            <button className="action-btn" onClick={() => navigate('/users')}>
                                <Users size={20} />
                                <span>Manage Users</span>
                            </button>
                        </div>
                    </div>

                    <div className="content-card glass-panel">
                        <div className="card-header">
                            <h3>Popular Content</h3>
                        </div>
                        <div className="popular-list">
                            {popularNews.length > 0 ? popularNews.map((news, index) => (
                                <div key={news._id || index} className="popular-item">
                                    <div className="popular-info">
                                        <div className="popular-title">{news.title}</div>
                                        <div className="popular-meta">
                                            <span><Eye size={12} /> {news.views || 0}</span>
                                            <span><ThumbsUp size={12} /> {news.likes || 0}</span>
                                            <span><MessageSquare size={12} /> {news.shares || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--slate-400)' }}>
                                    No popular news yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
