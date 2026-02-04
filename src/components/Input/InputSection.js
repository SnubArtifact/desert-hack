import { useEffect, useRef, useState } from "react";
import "./InputSection.css";

export default function InputSection({ value, onChange, onGenerate }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onChange(transcript);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, [onChange]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    listening
      ? recognitionRef.current.stop()
      : recognitionRef.current.start();
    setListening(!listening);
  };

  return (
    <div className="input-card">
      <textarea
        className="text-input"
        placeholder="Type or speak what you want to say…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />

      <div className="input-actions">
        <button
          className={`mic-btn ${listening ? "active" : ""}`}
          onClick={toggleListening}
        >
          🎙
        </button>

        <button
          className="generate-btn"
          disabled={!value.trim()}
          onClick={onGenerate}
        >
          Generate
        </button>
      </div>
    </div>
  );
}
