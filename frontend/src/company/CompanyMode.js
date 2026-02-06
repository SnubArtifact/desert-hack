import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import OrgDashboard from './pages/OrgDashboard';
import OrgSlangs from './components/OrgSlangs';
import Templates from './components/Templates';
import Analytics from './components/Analytics';
import './CompanyMode.css';

function CompanyModeContent({ onClose }) {
    const { user, loading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showAuth, setShowAuth] = useState(false);

    if (loading) {
        return <div className="company-loading">Loading...</div>;
    }

    if (!user) {
        return (
            <div className="company-container">
                <div className="company-header">
                    <h2>Company Mode</h2>
                    <button className="company-close" onClick={onClose}>×</button>
                </div>
                <div className="company-login-prompt">
                    <h3>Sign in to access Company Mode</h3>
                    <p>Create an organization, invite team members, and share slangs.</p>
                    <button onClick={() => setShowAuth(true)} className="company-btn primary">
                        Sign In / Sign Up
                    </button>
                </div>
                {showAuth && <AuthPage onClose={() => setShowAuth(false)} />}
            </div>
        );
    }

    return (
        <div className="company-container">
            <div className="company-header">
                <div className="company-header-left">
                    <h2>Company Mode</h2>
                    <span className="company-user">{user.email}</span>
                </div>
                <div className="company-header-right">
                    <button onClick={logout} className="company-btn outline">Logout</button>
                    <button className="company-close" onClick={onClose}>×</button>
                </div>
            </div>

            <div className="company-tabs">
                <button
                    className={activeTab === 'dashboard' ? 'active' : ''}
                    onClick={() => setActiveTab('dashboard')}
                >
                    Dashboard
                </button>
                <button
                    className={activeTab === 'slangs' ? 'active' : ''}
                    onClick={() => setActiveTab('slangs')}
                >
                    Shared Slangs
                </button>
                <button
                    className={activeTab === 'templates' ? 'active' : ''}
                    onClick={() => setActiveTab('templates')}
                >
                    Templates
                </button>
                <button
                    className={activeTab === 'analytics' ? 'active' : ''}
                    onClick={() => setActiveTab('analytics')}
                >
                    Analytics
                </button>
            </div>

            <div className="company-content">
                {activeTab === 'dashboard' && <OrgDashboard />}
                {activeTab === 'slangs' && <OrgSlangs />}
                {activeTab === 'templates' && <Templates />}
                {activeTab === 'analytics' && <Analytics />}
            </div>
        </div>
    );
}

export default function CompanyMode({ onClose }) {
    return (
        <AuthProvider>
            <div className="company-overlay">
                <CompanyModeContent onClose={onClose} />
            </div>
        </AuthProvider>
    );
}
