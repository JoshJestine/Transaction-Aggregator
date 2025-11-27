import React from 'react';
import { LayoutDashboard, Upload, Bot, LineChart, LogOut } from 'lucide-react';

const Header = ({ isConnected, onLogout }) => {
    return (
        <header className="dashboard-header">
            <div className="logo">
                <div className="logo-icon">
                    <LayoutDashboard size={24} color="white" />
                </div>
                <h1>FinVisor</h1>
            </div>
            <nav className="main-nav">
                <button className="nav-item active">
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                </button>
                <button className="nav-item">
                    <Upload size={18} />
                    <span>Upload Data</span>
                </button>
                <button className="nav-item">
                    <Bot size={18} />
                    <span>AI Advisor</span>
                </button>
                <button className="nav-item">
                    <LineChart size={18} />
                    <span>Insights</span>
                </button>
            </nav>
            <div className="user-profile">
                {isConnected && (
                    <button className="logout-button" onClick={onLogout} title="Logout">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
