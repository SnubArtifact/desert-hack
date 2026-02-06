import { useRef, useState } from "react";
import "./InputSection.css";
import { speechToText } from "../../services/SarvamAIService";

const TONES = [
  { id: "formal", label: " Formal", description: "Professional & polished" },
  { id: "friendly", label: " Friendly", description: "Warm & approachable" },
  { id: "assertive", label: " Assertive", description: "Confident & direct" },
];

export default function InputSection({ value, onChange, tone, onToneChange, onGenerate, loading }) {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [listening, setListening] = useState(false);
  const [processingAudio, setProcessingAudio] = useState(false);
  const [micError, setMicError] = useState("");

  // Clear text when recording starts
  useEffect(() => {
    if (listening) {
      console.log("Listening state true - clearing text");
      onChange("");
    }
  }, [listening]);

  const startRecording = async () => {
    try {
      setMicError("");
      // onChange(""); // Removed, handled by useEffect
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // MediaRecorder defaults to webm/opus in Chrome/Firefox or mp4/aac in Safari often
      // We explicitly request audio/webm if possible, or fallback to default
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      }

      const mediaRecorder = new MediaRecorder(stream, options);

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setProcessingAudio(true);

        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());

        const response = await speechToText(audioBlob);

        if (response.success) {
          onChange(response.transcript);
        } else {
          setMicError(response.error || "Failed to transcribe audio");
        }
        setProcessingAudio(false);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setListening(true);
    } catch (err) {
      console.error("Mic Error:", err);
      setMicError("Microphone access denied or not available");
      setListening(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && listening) {
      mediaRecorderRef.current.stop();
      setListening(false);
    }
  };

  const toggleListening = () => {
    if (listening) {
      stopRecording();
    } else {
      startRecording();
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
            disabled={loading || processingAudio}
            title={listening ? "Stop listening" : "Start speaking"}
          >
            {listening ? "🔴" : "🎙"}
          </button>
          {listening && <span className="listening-indicator">Listening...</span>}
          {processingAudio && <span className="listening-indicator">Processing...</span>}
          {micError && <span className="mic-error">{micError}</span>}
        </div>

        <button
          className="generate-btn"
          disabled={!value.trim() || loading}
          onClick={onGenerate}
        >
          {loading ? "Generating..." : "Generate "}
        </button>
      </div>
    </div>
  );
}
