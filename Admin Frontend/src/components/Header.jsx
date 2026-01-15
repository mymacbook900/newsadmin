import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const SEARCHABLE_PAGES = [
    { title: 'Dashboard', path: '/' },
    { title: 'User Management', path: '/users' },
    { title: 'Reporters', path: '/reporters' },
    { title: 'News Management', path: '/news' },
    { title: 'Communities', path: '/communities' },
    { title: 'Events', path: '/events' },
    { title: 'Activity Logs', path: '/activity' },
    { title: 'Reports & Moderation', path: '/reports' },
];

export default function Header({ onMenuClick }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredPages = SEARCHABLE_PAGES.filter(page =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleNavigate = (path) => {
        navigate(path);
        setSearchTerm('');
        setShowResults(false);
    };

    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-toggle" onClick={onMenuClick}>
                    <Menu size={24} />
                </button>
                <div className="search-bar header-search" ref={searchRef} style={{ position: 'relative' }}>
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search pages..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowResults(true);
                        }}
                        onFocus={() => setShowResults(true)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => { setSearchTerm(''); setShowResults(false); }}
                            style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', marginTop: "6px" }}
                        >
                            <X size={14} />
                        </button>
                    )}

                    {/* Search Results Dropdown */}
                    {showResults && searchTerm && (
                        <div className="search-dropdown" style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem',
                            marginTop: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            zIndex: 100,
                            maxHeight: '300px',
                            overflowY: 'auto'
                        }}>
                            {filteredPages.length > 0 ? (
                                filteredPages.map((page) => (
                                    <div
                                        key={page.path}
                                        className="search-item"
                                        onClick={() => handleNavigate(page.path)}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f1f5f9',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                                        onMouseLeave={(e) => e.target.style.background = 'white'}
                                    >
                                        {page.title}
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.875rem' }}>
                                    No pages found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="header-right">
                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="badge-dot"></span>
                </button>

                <div className="user-profile">
                    <img src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff" alt="Admin" className="avatar" />
                    <div className="user-info">
                        <span className="user-name">Admin User</span>
                        <span className="user-role">Super Admin</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
