import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faCopy, faCheck, faPen, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { getSlangs, addSlang, removeSlang } from "../../services/CustomSlangsService";
import { translateToCorporate, speechToText } from "../../services/SarvamAIService";
import "./Editor.css";

const TONES = [
  { id: "formal", label: "Formal" },
  { id: "standard", label: "Standard" },
  { id: "friendly", label: "Friendly" },
  { id: "assertive", label: "Assertive" },
];

const CHANNELS = [
  { id: "email", label: "Email", icon: faEnvelope },
  { id: "whatsapp", label: "WhatsApp", icon: faWhatsapp },
  { id: "linkedin", label: "LinkedIn", icon: faLinkedin },
];

export default function Editor() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [tone, setTone] = useState("formal");
  const [channel, setChannel] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Mic state
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [listening, setListening] = useState(false);
  const [processingAudio, setProcessingAudio] = useState(false);

  // Slangs state
  const [slangs, setSlangs] = useState([]);
  const [slangsExpanded, setSlangsExpanded] = useState(false);
  const [newSlang, setNewSlang] = useState("");
  const [newMeaning, setNewMeaning] = useState("");
  const [slangError, setSlangError] = useState("");

  useEffect(() => {
    setSlangs(getSlangs());
  }, []);

  const wordCount = (text) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError("");
    setOutputText("");
    setIsEditing(false);

    const response = await translateToCorporate(inputText, tone, channel);
    setLoading(false);

    if (response.success) {
      setOutputText(response.result);
    } else {
      setError(response.error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrySample = () => {
    setInputText("Yaar, boss ko batana hai ki project late ho jayega kyunki client ne last minute changes maange.");
  };

  // Mic functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let options = {};
      if (MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/webm" };
      }
      const mediaRecorder = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        setProcessingAudio(true);
        stream.getTracks().forEach((track) => track.stop());

        const response = await speechToText(audioBlob);
        if (response.success) {
          setInputText((prev) => prev + (prev ? " " : "") + response.transcript);
        }
        setProcessingAudio(false);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setListening(true);
    } catch (err) {
      console.error("Mic Error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && listening) {
      mediaRecorderRef.current.stop();
      setListening(false);
    }
  };

  const toggleListening = () => {
    if (listening) stopRecording();
    else startRecording();
  };

  // Slang functions
  const handleAddSlang = () => {
    if (!newSlang.trim() || !newMeaning.trim()) {
      setSlangError("Both fields required");
      return;
    }
    const success = addSlang(newSlang, newMeaning);
    if (success) {
      setSlangs(getSlangs());
      setNewSlang("");
      setNewMeaning("");
      setSlangError("");
    } else {
      setSlangError("Slang already exists");
    }
  };

  const handleRemoveSlang = (s) => {
    removeSlang(s);
    setSlangs(getSlangs());
  };

  return (
    <section className="editor-section">
      <h2 className="editor-title">Try it out</h2>
      <div className="editor-container">
        {/* Top Bar: Tones + Channels */}
        <div className="editor-topbar">
          <div className="editor-tones">
            {TONES.map((t) => (
              <button
                key={t.id}
                className={`tone-chip ${tone === t.id ? "active" : ""}`}
                onClick={() => setTone(t.id)}
                disabled={loading}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="editor-channels">
            {CHANNELS.map((c) => (
              <button
                key={c.id}
                className={`channel-chip ${channel === c.id ? "active" : ""}`}
                onClick={() => setChannel(c.id)}
                disabled={loading}
                title={c.label}
              >
                <FontAwesomeIcon icon={c.icon} />
                <span className="channel-label">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Editor */}
        <div className="editor-panels">
          {/* Input Panel */}
          <div className="editor-panel input-panel">
            <div className="panel-header">
              <span className="panel-label">Input</span>
              <span className="panel-hint">Your Hindi Slang</span>
            </div>
            <div className="textarea-wrapper">
              <textarea
                className="editor-textarea"
                placeholder="Type or paste your Hindi slang text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="panel-footer">
              <span className="word-count">{wordCount(inputText)} words</span>
              <div className="panel-actions">
                <button className="sample-btn" onClick={handleTrySample} disabled={loading}>
                  Try a sample ✨
                </button>
                <button
                  className={`mic-btn ${listening ? "active" : ""}`}
                  onClick={toggleListening}
                  disabled={loading || processingAudio}
                >
                  <FontAwesomeIcon icon={faMicrophone} />
                  {listening && <span className="mic-pulse" />}
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="editor-divider" />

          {/* Output Panel */}
          <div className="editor-panel output-panel">
            <div className="panel-header">
              <span className="panel-label">Corporate Ready</span>
              <span className="panel-hint">{channel.charAt(0).toUpperCase() + channel.slice(1)} Format</span>
            </div>
            <div className="textarea-wrapper">
              <textarea
                className={`editor-textarea ${isEditing ? "editing" : ""}`}
                placeholder="Formalized text will appear here..."
                value={outputText}
                onChange={(e) => setOutputText(e.target.value)}
                readOnly={!isEditing && !outputText}
              />
              {error && <div className="editor-error">{error}</div>}
            </div>
            <div className="panel-footer">
              <span className="word-count">{wordCount(outputText)} words</span>
              <div className="panel-actions">
                <button
                  className={`edit-btn ${isEditing ? "active" : ""}`}
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={!outputText}
                >
                  <FontAwesomeIcon icon={faPen} />
                  {isEditing ? " Done" : " Edit"}
                </button>
                <button
                  className="copy-btn"
                  onClick={handleCopy}
                  disabled={!outputText}
                >
                  <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                  {copied ? " Copied!" : " Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Generate Button */}
        <div className="editor-bottombar">
          <button
            className="slangs-toggle"
            onClick={() => setSlangsExpanded(!slangsExpanded)}
          >
            My Slangs {slangs.length > 0 && `(${slangs.length})`}
            <span className={`toggle-arrow ${slangsExpanded ? "open" : ""}`}>▾</span>
          </button>

          <button
            className="formalize-btn"
            onClick={handleGenerate}
            disabled={!inputText.trim() || loading}
          >
            {loading ? "Generating..." : "Formalize"}
          </button>
        </div>

        {/* Slangs Panel */}
        {slangsExpanded && (
          <div className="slangs-panel">
            <div className="add-slang-row">
              <input
                type="text"
                placeholder="Slang (e.g., 'pakka')"
                value={newSlang}
                onChange={(e) => setNewSlang(e.target.value)}
              />
              <input
                type="text"
                placeholder="Meaning (e.g., 'confirmed')"
                value={newMeaning}
                onChange={(e) => setNewMeaning(e.target.value)}
              />
              <button className="add-btn" onClick={handleAddSlang}>+ Add</button>
            </div>
            {slangError && <div className="slang-error">{slangError}</div>}
            {slangs.length > 0 && (
              <div className="slangs-list">
                {slangs.map((s) => (
                  <div key={s.slang} className="slang-chip">
                    <span className="slang-word">"{s.slang}"</span>
                    <span className="slang-meaning">= {s.meaning}</span>
                    <button className="remove-btn" onClick={() => handleRemoveSlang(s.slang)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
