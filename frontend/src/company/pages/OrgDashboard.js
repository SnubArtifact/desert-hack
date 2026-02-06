import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrg, createOrg, inviteMember, updateMemberRole, removeMember } from '../services/api';
import './Dashboard.css';

export default function OrgDashboard() {
    const { user, updateUser } = useAuth();
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [orgName, setOrgName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [error, setError] = useState('');
    const [inviteLink, setInviteLink] = useState('');

    useEffect(() => {
        if (user?.org) {
            loadOrg();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadOrg = async () => {
        try {
            const data = await getOrg();
            setOrg(data.org);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrg = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await createOrg(orgName);
            updateUser({ ...user, org: data.org, role: 'OWNER' });
            setOrg(data.org);
            setShowCreate(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await inviteMember(inviteEmail);
            setInviteLink(window.location.origin + data.inviteLink);
            setInviteEmail('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRoleChange = async (userId, role) => {
        try {
            await updateMemberRole(userId, role);
            loadOrg();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemove = async (userId) => {
        if (!window.confirm('Remove this member?')) return;
        try {
            await removeMember(userId);
            loadOrg();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="dash-loading">Loading...</div>;

    // No org - show create option
    if (!user?.org) {
        return (
            <div className="dash-container">
                <div className="dash-empty">
                    <h3>No Organization</h3>
                    <p>Create an organization to share slangs and templates with your team.</p>

                    {showCreate ? (
                        <form onSubmit={handleCreateOrg} className="dash-form">
                            <input
                                type="text"
                                placeholder="Organization name"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                required
                            />
                            {error && <div className="dash-error">{error}</div>}
                            <div className="dash-form-actions">
                                <button type="button" onClick={() => setShowCreate(false)}>Cancel</button>
                                <button type="submit" className="primary">Create</button>
                            </div>
                        </form>
                    ) : (
                        <button onClick={() => setShowCreate(true)} className="dash-btn primary">
                            Create Organization
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Has org - show dashboard
    return (
        <div className="dash-container">
            <div className="dash-header">
                <div>
                    <h2>{org?.name || user.org.name}</h2>
                    <span className="dash-role">{user.role}</span>
                </div>
                {['OWNER', 'ADMIN'].includes(user.role) && (
                    <button onClick={() => setShowInvite(true)} className="dash-btn primary">
                        Invite Member
                    </button>
                )}
            </div>

            {error && <div className="dash-error">{error}</div>}

            {showInvite && (
                <div className="dash-invite">
                    <form onSubmit={handleInvite}>
                        <input
                            type="email"
                            placeholder="Email to invite"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            required
                        />
                        <button type="submit">Send Invite</button>
                        <button type="button" onClick={() => { setShowInvite(false); setInviteLink(''); }}>
                            Cancel
                        </button>
                    </form>
                    {inviteLink && (
                        <div className="dash-invite-link">
                            <p>Share this link:</p>
                            <code>{inviteLink}</code>
                        </div>
                    )}
                </div>
            )}

            <div className="dash-stats">
                <div className="dash-stat">
                    <span className="stat-value">{org?.members?.length || 0}</span>
                    <span className="stat-label">Members</span>
                </div>
                <div className="dash-stat">
                    <span className="stat-value">{org?._count?.slangs || 0}</span>
                    <span className="stat-label">Slangs</span>
                </div>
                <div className="dash-stat">
                    <span className="stat-value">{org?._count?.templates || 0}</span>
                    <span className="stat-label">Templates</span>
                </div>
            </div>

            <div className="dash-members">
                <h3>Team Members</h3>
                <div className="members-list">
                    {org?.members?.map(member => (
                        <div key={member.id} className="member-item">
                            <div className="member-info">
                                <span className="member-name">{member.name || member.email}</span>
                                <span className="member-email">{member.email}</span>
                            </div>
                            <span className={`member-role ${member.role.toLowerCase()}`}>{member.role}</span>
                            {['OWNER', 'ADMIN'].includes(user.role) && member.role !== 'OWNER' && member.id !== user.id && (
                                <div className="member-actions">
                                    <select
                                        value={member.role}
                                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                    >
                                        <option value="MEMBER">Member</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                    <button onClick={() => handleRemove(member.id)} className="remove-btn">
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
