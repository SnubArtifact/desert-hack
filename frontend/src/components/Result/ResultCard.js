import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./ResultCard.css";

const CHANNEL_INFO = {
    email: { label: "Email", icon: "📧" },
    linkedin: { label: "LinkedIn Post", icon: "💼" },
    whatsapp: { label: "WhatsApp", icon: "💬" },
};

export default function ResultCard({ result, loading, error, channel }) {
    const cardRef = useRef(null);
    const channelInfo = CHANNEL_INFO[channel] || CHANNEL_INFO.email;

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
        if (result) {
            await navigator.clipboard.writeText(result);
            // Could add a toast notification here
        }
    };

    return (
        <div className="result-section">
            <div className="result-card" ref={cardRef}>
                <div className="result-header">
                    <span className="result-channel">
                        {channelInfo.icon} {channelInfo.label}
                    </span>
                    {result && (
                        <button className="copy-btn" onClick={handleCopy}>
                            📋 Copy
                        </button>
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
                            <span className="error-icon">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="result-text">{result}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
