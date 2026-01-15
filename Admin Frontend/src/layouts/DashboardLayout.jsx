import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './DashboardLayout.css';

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);

    return (
        <div className="layout-root">
            {/* Overlay for mobile */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            <Sidebar isOpen={sidebarOpen} className={sidebarOpen ? 'open' : ''} />

            <div className={`layout-content ${sidebarOpen ? 'sidebar-expanded' : ''}`}>
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
