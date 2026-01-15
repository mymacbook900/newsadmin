import { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Activity, Search, Filter, Eye, Download, Server, User, ShieldAlert } from 'lucide-react';
import { getLogsAPI } from '../services/userApi';

export default function ActivityManagement() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await getLogsAPI();
            setActivities(res.data.map(log => ({
                id: log._id,
                action: log.action,
                user: log.user,
                role: 'Admin', // Placeholder or use dynamic if available
                ip: '127.0.0.1',
                time: new Date(log.timestamp).toLocaleString(),
                status: 'Success',
                detail: log.details
            })));
        } catch (error) {
            console.error("Fetch Logs Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredActivities = activities.filter(item => {
        const matchesSearch = item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.action.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'All' || item.status === filterType;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Success': return 'success';
            case 'Failed': return 'danger';
            case 'Info': return 'info';
            default: return 'default';
        }
    };

    const getIconForUser = (role) => {
        switch (role) {
            case 'Admin': return <ShieldAlert size={16} className="text-primary" />;
            case 'System': return <Server size={16} className="text-secondary" />;
            default: return <User size={16} className="text-slate-500" />;
        }
    };

    const handleViewDetails = (activity) => {
        setSelectedActivity(activity);
        setIsModalOpen(true);
    };

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Action,User,Role,IP,Time,Status,Detail\n"
            + activities.map(a => `${a.id},${a.action},${a.user},${a.role},${a.ip},${a.time},${a.status},"${a.detail}"`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "activity_logs.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                    <h1>Activity Logs</h1>
                    <p className="text-secondary">Monitor system events and user actions</p>
                </div>
                <Button onClick={handleExport} variant="secondary">
                    <Download size={18} style={{ marginRight: '8px' }} />
                    Export Logs
                </Button>
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                    <Button variant={filterType !== 'All' ? 'primary' : 'secondary'} onClick={() => setIsFilterOpen(!isFilterOpen)}>
                        <Filter size={18} style={{ marginRight: '8px' }} />
                        {filterType === 'All' ? 'Filter Status' : filterType}
                    </Button>

                    {isFilterOpen && (
                        <div className="glass-panel dropdown-menu" style={{
                            position: 'absolute', top: '100%', marginTop: '8px',
                            padding: '0.5rem', minWidth: '160px', zIndex: 10, background: 'white',
                            borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}>
                            {['All', 'Success', 'Failed', 'Info'].map(type => (
                                <div
                                    key={type}
                                    style={{
                                        padding: '12px 12px',
                                        cursor: 'pointer',
                                        borderRadius: '6px',
                                        background: filterType === type ? '#f1f5f9' : 'transparent',
                                        color: filterType === type ? '#1e293b' : '#64748b',
                                        fontWeight: filterType === type ? '600' : '400',
                                        transition: 'background 0.2s'
                                    }}
                                    onClick={() => { setFilterType(type); setIsFilterOpen(false); }}
                                >
                                    {type}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="search-bar" style={{ flex: 1, minWidth: '250px', backgroundColor: 'white' }}>
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by user or action..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>User / Role</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {activities.length > 0 ? (
                        filteredActivities.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ padding: '0.5rem', background: '#f1f5f9', borderRadius: '0.375rem', color: '#64748b' }}>
                                            <Activity size={18} />
                                        </div>
                                        <span style={{ fontWeight: 500 }}>{item.action}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {getIconForUser(item.role)}
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.user}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.role}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{item.ip}</span>
                                </TableCell>
                                <TableCell>{item.time}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusColor(item.status)}>{item.status}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(item)} title="View Details">
                                        <Eye size={18} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell className="text-center" colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                                {loading ? 'Loading system logs...' : 'No activities found matching filters.'}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Detail Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Activity Details"
            >
                {selectedActivity && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Action Type</label>
                                <div style={{ fontWeight: 600 }}>{selectedActivity.action}</div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <div><Badge variant={getStatusColor(selectedActivity.status)}>{selectedActivity.status}</Badge></div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">User</label>
                                <div>{selectedActivity.user} ({selectedActivity.role})</div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Timestamp</label>
                                <div>{selectedActivity.time}</div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">IP Address</label>
                                <div style={{ fontFamily: 'monospace' }}>{selectedActivity.ip}</div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Log Details</label>
                            <div style={{ padding: '1rem', background: '#1e293b', color: '#e2e8f0', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                {selectedActivity.detail}
                            </div>
                        </div>

                        <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
