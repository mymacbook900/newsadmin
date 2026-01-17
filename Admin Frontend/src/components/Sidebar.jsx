import { useNavigate, useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    Newspaper,
    UsersRound,
    Calendar,
    ChevronDown,
    ChevronRight,
    User,
    FlagTriangleRight,
    Settings,
    LogOut,
    BookOpen,
    Bookmark,
    Clock,
} from 'lucide-react';
import clsx from 'clsx';
import './Sidebar.css';

const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    {
        label: 'User Management',
        icon: Users,
        path: '/users', // Parent path for matching
        children: [
            { label: 'All Users', path: '/users/all', icon: UsersRound }, // Changed icon to distinguish
            { label: 'Admins', path: '/users/admins', icon: User }, // New icon import needed
            { label: 'Reporters', path: '/users/reporters', icon: UserCheck },
        ]
    },
    { label: 'News Management', path: '/news', icon: Newspaper },
    { label: 'Communities', path: '/communities', icon: UsersRound },
    { label: 'Reporter Events', path: '/events', icon: Calendar },
    { label: 'My Activity', path: '/my-activity', icon: Clock },
    { label: 'Saved Content', path: '/saved', icon: Bookmark },
    { label: 'Insights & Controls', path: '/moderation', icon: FlagTriangleRight },
    { label: 'Case Studies', path: '/casestudies', icon: BookOpen },
    { label: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, className }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenu, setExpandedMenu] = useState({});

    // Get user from localStorage
    const userJson = localStorage.getItem('adminUser');
    const user = userJson ? JSON.parse(userJson) : null;
    const isReporter = user?.role === 'Reporter';
    const isAdmin = user?.role === 'Admin'; // Assuming 'Admin' is the role for administrators

    // Build dynamic nav items
    const filteredNavItems = [...navItems];
    if (isReporter || isAdmin) { // Admins can also see Reporting Hub for moderation/testing
        // Add Reporting Hub for reporters and admins
        filteredNavItems.push({ label: 'Reporting Hub', path: '/reporting-hub', icon: LayoutDashboard });
    }

    const toggleMenu = (label) => {
        setExpandedMenu(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('isAdminAuthenticated');
            localStorage.removeItem('adminUser');
            navigate('/login');
        }
    };

    return (
        <aside className={clsx('sidebar', { 'sidebar-closed': !isOpen }, className)}>
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-icon" />
                    <span className="logo-text">AdminPanel</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {filteredNavItems.map((item) => {
                    if (item.children) {
                        const isExpanded = expandedMenu[item.label] || location.pathname.startsWith(item.path);
                        const isActiveParent = location.pathname.startsWith(item.path);

                        return (
                            <div key={item.label} className="nav-group">
                                <div
                                    className={clsx('nav-item', { active: isActiveParent })}
                                    onClick={() => toggleMenu(item.label)}
                                    style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <item.icon size={20} />
                                        <span className="nav-label">{item.label}</span>
                                    </div>
                                    <span className="nav-label">
                                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </span>
                                </div>
                                {isExpanded && (
                                    <div className="nav-children" style={{ paddingLeft: '1rem' }}>
                                        {item.children.map(child => (
                                            <NavLink
                                                key={child.path}
                                                to={child.path}
                                                className={({ isActive }) => clsx('nav-item', { active: isActive })}
                                                style={{ fontSize: '0.9em' }}
                                            >
                                                <child.icon size={18} />
                                                <span className="nav-label">{child.label}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => clsx('nav-item', { active: isActive })}
                        >
                            <item.icon size={20} />
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span className="nav-label">Logout</span>
                </button>
            </div>
        </aside>
    );
}
