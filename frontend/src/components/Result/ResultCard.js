import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./ResultCard.css";

const CHANNEL_INFO = {
    email: { label: "Email" },
    linkedin: { label: "LinkedIn Post" },
    whatsapp: { label: "WhatsApp" },
};

export default function ResultCard({ result, loading, error, channel }) {
    const cardRef = useRef(null);
    const [text, setText] = useState(result || "");
    const [isEditing, setIsEditing] = useState(false);
    const channelInfo = CHANNEL_INFO[channel] || CHANNEL_INFO.email;

    useEffect(() => {
        setText(result || "");
        setIsEditing(false);
    }, [result]);

    useEffect(() => {
        if (cardRef.current) {
            gsap.fromTo(
                cardRef.current,
                { y: 30, opacity: 0, scale: 0.98 },
                { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" }
            );
        }
    }, [result, loading, error]);

    const handleCopy = async () => {
        if (text) {
            await navigator.clipboard.writeText(text);
            // Could add a toast notification here
        }
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    return (
        <div className="result-section">
            <div className="result-card" ref={cardRef}>
                <div className="result-header">
                    <span className="result-channel">
                        {channelInfo.icon} {channelInfo.label}
                    </span>
                    {text && (
                        <div className="result-actions">
                            <button
                                className={`edit-btn ${isEditing ? 'active' : ''}`}
                                onClick={toggleEdit}
                            >
                                {isEditing ? ' Done' : ' Edit'}
                            </button>
                            <button className="copy-btn" onClick={handleCopy}>
                                Copy
                            </button>
                        </div>
                    )}
                </div>

                <div className="result-content">
                    {loading && (
                        <div className="result-loading">
                            <div className="loading-spinner" />
                            <span>Transforming your message...</span>
                        </div>
                    )}

                    {error && (
                        <div className="result-error">
                            
                            <span>{error}</span>
                        </div>
                    )}

                    {!loading && (
                        <textarea
                            className={`result-text editable-result ${isEditing ? 'editing' : ''}`}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            readOnly={!isEditing}
                            placeholder={result ? "" : "Your formalized message will appear here..."}
                            spellCheck="false"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
