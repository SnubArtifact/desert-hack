import React, { useState, useEffect } from 'react';
import { getOrg, getOrgSlangs, getTemplates } from '../services/api';
import './Analytics.css';

export default function Analytics() {
    const [stats, setStats] = useState({
        memberCount: 0,
        slangCount: 0,
        approvedSlangs: 0,
        pendingSlangs: 0,
        templateCount: 0,
        topSlangs: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [org, slangs, templates] = await Promise.all([
                getOrg().catch(() => null),
                getOrgSlangs().catch(() => []),
                getTemplates().catch(() => [])
            ]);

            const approvedSlangs = slangs.filter(s => s.isApproved);
            const pendingSlangs = slangs.filter(s => !s.isApproved);

            setStats({
                memberCount: org?.members?.length || 0,
                slangCount: slangs.length,
                approvedSlangs: approvedSlangs.length,
                pendingSlangs: pendingSlangs.length,
                templateCount: templates.length,
                topSlangs: approvedSlangs.slice(0, 5)
            });
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="analytics-loading">Loading analytics...</div>;
    }

    return (
        <div className="analytics-container">
            <h3>Organization Analytics</h3>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats.memberCount}</div>
                    <div className="stat-label">Team Members</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.slangCount}</div>
                    <div className="stat-label">Total Slangs</div>
                </div>
                <div className="stat-card approved">
                    <div className="stat-value">{stats.approvedSlangs}</div>
                    <div className="stat-label">Approved</div>
                </div>
                <div className="stat-card pending">
                    <div className="stat-value">{stats.pendingSlangs}</div>
                    <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.templateCount}</div>
                    <div className="stat-label">Templates</div>
                </div>
            </div>

            {stats.topSlangs.length > 0 && (
                <div className="top-slangs">
                    <h4>Active Slangs</h4>
                    <div className="slangs-list">
                        {stats.topSlangs.map(slang => (
                            <div key={slang.id} className="slang-item">
                                <span className="slang-word">"{slang.slang}"</span>
                                <span className="slang-arrow">→</span>
                                <span className="slang-meaning">{slang.meaning}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
