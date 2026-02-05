import { useEffect, useRef, useState } from "react";
import "./InputSection.css";

const TONES = [
  { id: "formal", label: "🎩 Formal", description: "Professional & polished" },
  { id: "friendly", label: "😊 Friendly", description: "Warm & approachable" },
  { id: "assertive", label: "💪 Assertive", description: "Confident & direct" },
];

export default function InputSection({ value, onChange, tone, onToneChange, onGenerate, loading }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState("");
  const valueRef = useRef(value);

  // Keep valueRef in sync with value prop
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "hi-IN";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Append final transcript to existing value
      if (finalTranscript) {
        const newValue = valueRef.current + (valueRef.current ? " " : "") + finalTranscript;
        onChange(newValue);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setMicError("Microphone access denied. Please allow mic permission.");
      } else if (event.error === "no-speech") {
        setMicError("No speech detected. Try again.");
      } else {
        setMicError(`Error: ${event.error}`);
      }
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, [onChange]);

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      setMicError("Speech recognition not available");
      return;
    }

    setMicError("");

    if (listening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (error) {
        console.error("Failed to start recognition:", error);
        setMicError("Failed to start microphone");
      }
    }
  };

  return (
    <div className="input-card">
      <textarea
        className="text-input"
        placeholder="Type or speak your Hindi slang here… e.g., 'Yaar, boss ko batana hai ki project late ho jayega'"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        disabled={loading}
      />

      <div className="tone-selector">
        <span className="tone-label">Tone:</span>
        <div className="tone-options">
          {TONES.map((t) => (
            <button
              key={t.id}
              className={`tone-btn ${tone === t.id ? "active" : ""}`}
              onClick={() => onToneChange(t.id)}
              disabled={loading}
              title={t.description}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="input-actions">
        <div className="mic-area">
          <button
            className={`mic-btn ${listening ? "active" : ""}`}
            onClick={toggleListening}
            disabled={loading}
            title={listening ? "Stop listening" : "Start speaking"}
          >
            {listening ? "🔴" : "🎙"}
          </button>
          {listening && <span className="listening-indicator">Listening...</span>}
          {micError && <span className="mic-error">{micError}</span>}
        </div>

        <button
          className="generate-btn"
          disabled={!value.trim() || loading}
          onClick={onGenerate}
        >
          {loading ? "Generating..." : "Generate ✨"}
        </button>
      </div>
    </div>
  );
}
