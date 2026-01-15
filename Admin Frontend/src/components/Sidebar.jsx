import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    Newspaper,
    UsersRound,
    Calendar,
    FlagTriangleRight,
    Settings,
    LogOut,
    Activity,
    BookOpen
} from 'lucide-react';
import clsx from 'clsx';
import './Sidebar.css';

const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'User Management', path: '/users', icon: Users },
    { label: 'Reporters', path: '/reporters', icon: UserCheck },
    { label: 'News Management', path: '/news', icon: Newspaper },
    { label: 'Communities', path: '/communities', icon: UsersRound },
    { label: 'Reporter Events', path: '/events', icon: Calendar },
    { label: 'Activity', path: '/activity', icon: Activity },
    { label: 'Reports & Mod', path: '/reports', icon: FlagTriangleRight },
    { label: 'Case Studies', path: '/casestudies', icon: BookOpen },
    { label: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, className }) {
    const navigate = useNavigate();

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
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => clsx('nav-item', { active: isActive })}
                    >
                        <item.icon size={20} />
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}
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
