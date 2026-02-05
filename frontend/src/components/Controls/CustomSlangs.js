import { useState, useEffect } from "react";
import { getSlangs, addSlang, removeSlang } from "../../services/CustomSlangsService";
import "./CustomSlangs.css";

export default function CustomSlangs() {
    const [slangs, setSlangs] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [slang, setSlang] = useState("");
    const [meaning, setMeaning] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        setSlangs(getSlangs());
    }, []);

    const handleAdd = () => {
        if (!slang.trim() || !meaning.trim()) {
            setError("Both fields required");
            return;
        }
        const success = addSlang(slang, meaning);
        if (success) {
            setSlangs(getSlangs());
            setSlang("");
            setMeaning("");
            setError("");
        } else {
            setError("Slang already exists");
        }
    };

    const handleRemove = (s) => {
        removeSlang(s);
        setSlangs(getSlangs());
    };

    return (
        <div className="custom-slangs">
            <button
                className="custom-slangs-toggle"
                onClick={() => setExpanded(!expanded)}
            >
                My Slangs {slangs.length > 0 && `(${slangs.length})`}
                <span className={`toggle-arrow ${expanded ? "open" : ""}`}>▾</span>
            </button>

            {expanded && (
                <div className="custom-slangs-panel">
                    <div className="add-slang-form">
                        <input
                            type="text"
                            placeholder="Slang (e.g., 'pakka')"
                            value={slang}
                            onChange={(e) => setSlang(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Meaning (e.g., 'confirmed/definite')"
                            value={meaning}
                            onChange={(e) => setMeaning(e.target.value)}
                        />
                        <button onClick={handleAdd}>+ Add</button>
                    </div>
                    {error && <div className="slang-error">{error}</div>}

                    {slangs.length > 0 && (
                        <div className="slangs-list">
                            {slangs.map((s) => (
                                <div key={s.slang} className="slang-item">
                                    <span className="slang-word">"{s.slang}"</span>
                                    <span className="slang-meaning">= {s.meaning}</span>
                                    <button
                                        className="remove-btn"
                                        onClick={() => handleRemove(s.slang)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
