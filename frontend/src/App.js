import { useState, useEffect } from "react";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import Features from "./components/Features/Features";
import ChannelToast from "./components/Controls/ChannelToast";
import CustomSlangs from "./components/Controls/CustomSlangs";
import ResultCard from "./components/Result/ResultCard";
import { translateToCorporate } from "./services/SarvamAIService";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [tone, setTone] = useState("formal");
  const [channel, setChannel] = useState(null);
  const [showChannelToast, setShowChannelToast] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleGenerate = () => {
    if (!inputText.trim()) return;
    setShowChannelToast(true);
  };

  const handleChannelSelect = async (selectedChannel) => {
    setChannel(selectedChannel);
    setShowChannelToast(false);
    setLoading(true);
    setError("");
    setResult("");

    const response = await translateToCorporate(inputText, tone, selectedChannel);

    setLoading(false);
    if (response.success) {
      setResult(response.result);
    } else {
      setError(response.error);
    }
  };

  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <Hero />

      <Features
        inputText={inputText}
        setInputText={setInputText}
        tone={tone}
        setTone={setTone}
        onGenerate={handleGenerate}
        loading={loading}
      />

      <CustomSlangs />

      {showChannelToast && (
        <ChannelToast
          onSelect={handleChannelSelect}
          onClose={() => setShowChannelToast(false)}
        />
      )}

      {(result || loading || error) && (
        <ResultCard
          result={result}
          loading={loading}
          error={error}
          channel={channel}
        />
      )}
    </>
  );
}
