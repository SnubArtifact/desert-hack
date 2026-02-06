import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrgSlangs, addOrgSlang, approveOrgSlang, deleteOrgSlang } from '../services/api';
import './OrgSlangs.css';

export default function OrgSlangs() {
    const { user } = useAuth();
    const [slangs, setSlangs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [slang, setSlang] = useState('');
    const [meaning, setMeaning] = useState('');
    const [error, setError] = useState('');

    const isAdmin = ['OWNER', 'ADMIN'].includes(user?.role);

    useEffect(() => {
        if (user?.org) loadSlangs();
        else setLoading(false);
    }, [user]);

    const loadSlangs = async () => {
        try {
            const data = await getOrgSlangs();
            setSlangs(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!slang.trim() || !meaning.trim()) return;
        setError('');
        try {
            await addOrgSlang(slang, meaning);
            setSlang('');
            setMeaning('');
            loadSlangs();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveOrgSlang(id);
            loadSlangs();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this slang?')) return;
        try {
            await deleteOrgSlang(id);
            loadSlangs();
        } catch (err) {
            setError(err.message);
        }
    };

    if (!user?.org) {
        return (
            <div className="org-slangs-empty">
                <p>Join an organization to access shared slangs.</p>
            </div>
        );
    }

    const exportToCSV = () => {
        const approvedSlangs = slangs.filter(s => s.isApproved);
        if (approvedSlangs.length === 0) {
            alert('No approved slangs to export');
            return;
        }
        const csvContent = [
            ['Slang', 'Meaning'],
            ...approvedSlangs.map(s => [s.slang, s.meaning])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${user.org.name.replace(/\s+/g, '_')}_slangs.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="org-slangs">
            <div className="org-slangs-header">
                <h3>Organization Slangs</h3>
                <button onClick={exportToCSV} className="export-btn">
                    Export CSV
                </button>
            </div>
            <p className="org-slangs-desc">
                Shared slangs used by everyone in {user.org.name}
            </p>

            {isAdmin && (
                <form onSubmit={handleAdd} className="org-slangs-form">
                    <input
                        type="text"
                        placeholder="Slang (e.g., 'jugaad')"
                        value={slang}
                        onChange={(e) => setSlang(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Meaning (e.g., 'creative solution')"
                        value={meaning}
                        onChange={(e) => setMeaning(e.target.value)}
                    />
                    <button type="submit">Add</button>
                </form>
            )}

            {error && <div className="org-slangs-error">{error}</div>}

            {loading ? (
                <p>Loading...</p>
            ) : slangs.length === 0 ? (
                <p className="org-slangs-empty-list">No slangs yet. {isAdmin ? 'Add the first one!' : ''}</p>
            ) : (
                <div className="org-slangs-list">
                    {slangs.map(s => (
                        <div key={s.id} className={`org-slang-item ${!s.isApproved ? 'pending' : ''}`}>
                            <div className="slang-content">
                                <span className="slang-word">"{s.slang}"</span>
                                <span className="slang-meaning">= {s.meaning}</span>
                                {!s.isApproved && <span className="slang-badge pending">Pending</span>}
                            </div>
                            {isAdmin && (
                                <div className="slang-actions">
                                    {!s.isApproved && (
                                        <button onClick={() => handleApprove(s.id)} className="approve-btn">
                                            Approve
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(s.id)} className="delete-btn">×</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
