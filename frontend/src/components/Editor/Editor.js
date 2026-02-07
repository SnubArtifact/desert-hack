import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faCopy, faCheck, faPen, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { getSlangs, addSlang, removeSlang } from "../../services/CustomSlangsService";
import { translateToCorporate, speechToText } from "../../services/SarvamAIService";
import PersistenceService from "../../services/PersistenceService";
import TemplateService from "../../services/TemplateService";
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
  const [slangSuccess, setSlangSuccess] = useState(false);

  // Persistence & History state
  const [history, setHistory] = useState([]);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  // Template state
  const [templatesExpanded, setTemplatesExpanded] = useState(false);
  const templates = TemplateService.getTemplates();

  const inputAreaRef = useRef(null);

  useEffect(() => {
    setSlangs(getSlangs());
    setHistory(PersistenceService.getHistory());

    // Auto-focus input on mount
    if (inputAreaRef.current) {
      inputAreaRef.current.focus();
    }

    // Load Draft
    const draft = PersistenceService.getDraft();
    if (draft) {
      setInputText(draft.inputText || "");
      setOutputText(draft.outputText || "");
      setTone(draft.tone || "formal");
      setChannel(draft.channel || "email");
    }
  }, []);

  // Auto-save draft on change
  useEffect(() => {
    PersistenceService.saveDraft(inputText, outputText, tone, channel);
  }, [inputText, outputText, tone, channel]);

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleGenerate();
    }
  };



  const wordCount = (text) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
  };

  // Tone Comparison state
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonResults, setComparisonResults] = useState({});

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError("");
    setOutputText("");
    setComparisonResults({});
    setIsEditing(false);

    if (compareMode) {
      const tonesToCompare = ['formal', 'friendly', 'assertive'];
      const results = {};

      try {
        const responses = await Promise.all(tonesToCompare.map((t) => translateToCorporate(inputText, t, channel)));

        let subErrors = [];
        responses.forEach((resp, index) => {
          const t = tonesToCompare[index];
          if (resp.success) {
            results[t] = resp.result;
          } else {
            subErrors.push(`${t}: ${resp.error}`);
          }
        });

        if (subErrors.length > 0 && Object.keys(results).length === 0) {
          throw new Error(subErrors.join(", "));
        }

        setComparisonResults(results);
        if (results['formal']) {
          setOutputText(results['formal']); // Default to formal
          PersistenceService.addToHistory(inputText, results['formal'], 'formal', channel);
        }
      } catch (err) {
        setError("One or more comparisons failed.");
      }
    } else {
      const response = await translateToCorporate(inputText, tone, channel);
      if (response.success) {
        setOutputText(response.result);
        const updatedHistory = PersistenceService.addToHistory(inputText, response.result, tone, channel);
        setHistory(updatedHistory);
      } else {
        setError(response.error);
      }
    }

    setLoading(false);
  };

  const handleLoadHistory = (item) => {
    setInputText(item.input);
    setOutputText(item.output);
    setTone(item.tone);
    setChannel(item.channel);
    setHistoryExpanded(false);

    // Scroll up to editor
    // Scroll up to editor safely
    const target = document.getElementById('translator');
    if (target) {
      window.scrollTo({ top: target.offsetTop - 100, behavior: 'smooth' });
    }
  };


  const handleLoadTemplate = (t) => {
    setInputText(t.text);
    setTemplatesExpanded(false);
    if (inputAreaRef.current) inputAreaRef.current.focus();
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
      setSlangSuccess(true);
      setTimeout(() => setSlangSuccess(false), 2000);
    } else {
      setSlangError("Slang already exists");
    }
  };

  const handleRemoveSlang = (s) => {
    removeSlang(s);
    setSlangs(getSlangs());
  };

  return (
    <section id="translator" className="editor-section">
      <h2 className="editor-title">Try it out</h2>
      <div className="editor-container">
        {/* Top Bar: Tone Selection */}
        <div className="editor-topbar">
          <div className="topbar-left-tools">
            <div className="editor-tones">
              <span className="editor-label">Pick Tone:</span>
              {TONES.map((t) => {
                const desc = t.id === 'formal' ? "Highly professional" :
                  t.id === 'friendly' ? "Warm and approachable" :
                    t.id === 'assertive' ? "Confident and direct" : "Standard tone";
                return (
                  <button
                    key={t.id}
                    className={`tone-chip ${tone === t.id ? "active" : ""} ${compareMode ? "disabled" : ""}`}
                    onClick={() => setTone(t.id)}
                    disabled={loading || compareMode}
                    title={desc}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="comparison-toggle">
              <span className="toggle-label">Compare Mode</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={compareMode}
                  onChange={(e) => setCompareMode(e.target.checked)}
                  disabled={loading}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        {compareMode && Object.keys(comparisonResults).length > 0 && (
          <div className="comparison-grid">
            {Object.entries(comparisonResults).map(([t, result]) => (
              <div key={t} className={`comparison-card ${tone === t ? "active" : ""}`} onClick={() => {
                setTone(t);
                setOutputText(result);
              }}>
                <div className="comparison-card-header">{t}</div>
                <div className="comparison-card-body">{result.substring(0, 120)}{result.length > 120 ? "..." : ""}</div>
                <div className="comparison-card-footer">Click to focus</div>
              </div>
            ))}
          </div>
        )}

        {/* Main Editor */}
        <div className="editor-panels">
          {/* Input Panel */}
          <div className="editor-panel input-panel">
            <div className="panel-header">
              <span className="panel-label">Input</span>
              <span className="panel-hint">Your Slang</span>
            </div>
            <div className="textarea-wrapper">
              <textarea
                ref={inputAreaRef}
                className="editor-textarea"
                placeholder="Type or paste your slang text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
            </div>
            <div className="panel-footer">
              <span className="word-count">{wordCount(inputText)} words</span>
              <div className="panel-actions">
                <button className="sample-btn" onClick={handleTrySample} disabled={loading} title="Try a sample text">
                  Sample
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
              <span className="panel-label">Post to:</span>
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
            <div className="textarea-wrapper">
              {loading ? (
                <div className="thinking-container">
                  <div className="thinking-text">Formalizing your thoughts</div>
                  <div className="typing-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              ) : (
                <textarea
                  className={`editor-textarea ${isEditing ? "editing" : ""} ${!outputText ? "empty" : ""} preview-${channel}`}
                  placeholder="Formalized text will appear here..."
                  value={outputText}
                  onChange={(e) => setOutputText(e.target.value)}
                  readOnly={!isEditing}
                />
              )}
              {error && <div className="editor-error">{error}</div>}
            </div>
            <div className="panel-footer">
              <span className="word-count">{wordCount(outputText)} words</span>
              {outputText && (
                <div className="panel-actions">
                  <button
                    className={`edit-btn ${isEditing ? "active" : ""}`}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <FontAwesomeIcon icon={faPen} />
                    {isEditing ? " Done" : " Edit"}
                  </button>
                  <button
                    className="copy-btn"
                    onClick={handleCopy}
                  >
                    <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                    {copied ? " Copied!" : " Copy"}
                  </button>
                  <button
                    className="gmail-btn"
                    onClick={() => {
                      let subject = "Formalized Message";
                      let body = outputText;

                      // Try to parse subject if present (e.g., "Subject: Title\n\nBody")
                      const subjectMatch = outputText.match(/^Subject:\s*(.*)/i);
                      if (subjectMatch) {
                        subject = subjectMatch[1].trim();
                        // Remove the subject line and any following empty lines from the body
                        body = outputText.replace(/^Subject:.*\n*/i, "").trim();
                      }

                      const encodedSubject = encodeURIComponent(subject);
                      const encodedBody = encodeURIComponent(body);
                      window.open(`https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodedSubject}&body=${encodedBody}`, "_blank");
                    }}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    {" Gmail"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Action Buttons & Toggles */}
        <div className="editor-bottombar">
          <div className="bottombar-left">
            <button
              className={`slangs-toggle ${slangsExpanded ? "active" : ""}`}
              onClick={() => {
                setSlangsExpanded(!slangsExpanded);
                if (historyExpanded) setHistoryExpanded(false);
              }}
            >
              My Slangs {slangs.length > 0 && `(${slangs.length})`}
              <span className={`toggle-arrow ${slangsExpanded ? "open" : ""}`}>▾</span>
            </button>

            <button
              className={`history-toggle ${historyExpanded ? "active" : ""}`}
              onClick={() => {
                setHistoryExpanded(!historyExpanded);
                if (slangsExpanded) setSlangsExpanded(false);
                if (templatesExpanded) setTemplatesExpanded(false);
              }}
            >
              History {history.length > 0 && `(${history.length})`}
              <span className={`toggle-arrow ${historyExpanded ? "open" : ""}`}>▾</span>
            </button>

            <button
              className={`templates-toggle ${templatesExpanded ? "active" : ""}`}
              onClick={() => {
                setTemplatesExpanded(!templatesExpanded);
                if (slangsExpanded) setSlangsExpanded(false);
                if (historyExpanded) setHistoryExpanded(false);
              }}
            >
              Templates
              <span className={`toggle-arrow ${templatesExpanded ? "open" : ""}`}>▾</span>
            </button>
          </div>

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
          <div id="slangs" className="slangs-panel">
            <div className="panel-inner-title">Custom Slang Dictionary</div>
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
            {slangSuccess && <div className="slang-success-msg">Slang added successfully! ✨</div>}
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

        {/* History Panel */}
        {historyExpanded && (
          <div id="history" className="history-panel">
            <div className="panel-inner-title">Recent Translations</div>
            {history.length === 0 ? (
              <div className="empty-panel-msg">Your translation history will appear here.</div>
            ) : (
              <div className="history-list">
                {history.map((item) => (
                  <div key={item.id} className="history-item" onClick={() => handleLoadHistory(item)}>
                    <div className="history-item-top">
                      <span className="history-tone">{item.tone}</span>
                      <span className="history-time">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="history-item-input">{item.input.substring(0, 60)}{item.input.length > 60 ? "..." : ""}</div>
                  </div>
                ))}
              </div>
            )}
            <button className="clear-history-btn" onClick={() => {
              PersistenceService.clearHistory();
              setHistory([]);
            }}>Clear History</button>
          </div>
        )}

        {/* Templates Panel */}
        {templatesExpanded && (
          <div id="templates" className="templates-panel">
            <div className="panel-inner-title">Template Library</div>
            <div className="templates-grid">
              {templates.map((t) => (
                <div key={t.id} className="template-card" onClick={() => handleLoadTemplate(t)}>
                  <div className="template-card-icon">
                    <FontAwesomeIcon icon={faPen} />
                  </div>
                  <div className="template-card-content">
                    <div className="template-card-title">{t.title}</div>
                    <div className="template-card-desc">{t.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
