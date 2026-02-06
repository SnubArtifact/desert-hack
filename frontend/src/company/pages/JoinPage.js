import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { joinOrg } from '../services/api';
import './JoinPage.css';

export default function JoinPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const [orgName, setOrgName] = useState('');

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid invite link. No token provided.');
            return;
        }

        const processInvite = async () => {
            try {
                const result = await joinOrg(token);
                setStatus('success');
                setOrgName(result.org?.name || 'the organization');
                setMessage(`You've successfully joined ${result.org?.name || 'the organization'}!`);
            } catch (err) {
                setStatus('error');
                if (err.message.includes('expired')) {
                    setMessage('This invite link has expired. Please ask for a new invite.');
                } else if (err.message.includes('logged in')) {
                    setMessage('Please sign in first to accept this invitation.');
                } else {
                    setMessage(err.message || 'Failed to process invitation.');
                }
            }
        };

        processInvite();
    }, [token]);

    return (
        <div className="join-page">
            <div className="join-card">
                <div className="join-logo">
                    <span className="logo-text">Formalize</span>
                </div>

                {status === 'loading' && (
                    <div className="join-loading">
                        <div className="spinner"></div>
                        <p>Processing your invitation...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="join-success">
                        <div className="success-icon">✓</div>
                        <h2>Welcome to {orgName}!</h2>
                        <p>{message}</p>
                        <button onClick={() => navigate('/')} className="join-btn">
                            Go to Formalize
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="join-error">
                        <div className="error-icon">!</div>
                        <h2>Invitation Error</h2>
                        <p>{message}</p>
                        <button onClick={() => navigate('/')} className="join-btn outline">
                            Go to Homepage
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
