import React, { useState, useEffect } from 'react';
import { getTemplates, createTemplate, deleteTemplate } from '../services/api';
import './Templates.css';

export default function Templates() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        content: '',
        channel: 'EMAIL'
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const data = await getTemplates();
            setTemplates(data);
        } catch (err) {
            setError('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const newTemplate = await createTemplate(formData);
            setTemplates([...templates, newTemplate]);
            setFormData({ name: '', content: '', channel: 'EMAIL' });
            setShowForm(false);
        } catch (err) {
            setError(err.message || 'Failed to create template');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteTemplate(id);
            setTemplates(templates.filter(t => t.id !== id));
        } catch (err) {
            setError('Failed to delete template');
        }
    };

    const copyToClipboard = (content) => {
        navigator.clipboard.writeText(content);
    };

    if (loading) return <div className="templates-loading">Loading templates...</div>;

    return (
        <div className="templates-container">
            <div className="templates-header">
                <h3>Message Templates</h3>
                <button className="add-template-btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ New Template'}
                </button>
            </div>

            {error && <div className="templates-error">{error}</div>}

            {showForm && (
                <form className="template-form" onSubmit={handleCreate}>
                    <input
                        type="text"
                        placeholder="Template name (e.g., Meeting Invite)"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <select
                        value={formData.channel}
                        onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                    >
                        <option value="EMAIL">Email</option>
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="LINKEDIN">LinkedIn</option>
                    </select>
                    <textarea
                        placeholder="Template content...&#10;Use {name}, {date}, {topic} for variables"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={6}
                        required
                    />
                    <button type="submit" className="save-template-btn">Save Template</button>
                </form>
            )}

            {templates.length === 0 ? (
                <div className="no-templates">
                    <p>No templates yet. Create one to share with your team!</p>
                </div>
            ) : (
                <div className="templates-grid">
                    {templates.map(template => (
                        <div key={template.id} className="template-card">
                            <div className="template-card-header">
                                <span className="template-name">{template.name}</span>
                                <span className={`template-channel ${template.channel.toLowerCase()}`}>
                                    {template.channel}
                                </span>
                            </div>
                            <div className="template-content">
                                {template.content}
                            </div>
                            <div className="template-actions">
                                <button
                                    className="copy-btn"
                                    onClick={() => copyToClipboard(template.content)}
                                >
                                    Copy
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(template.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
