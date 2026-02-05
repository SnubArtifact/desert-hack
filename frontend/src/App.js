import { useState } from "react";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import Features from "./components/Features/Features";
import ChannelToast from "./components/Controls/ChannelToast";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [channel, setChannel] = useState(null);
  const [showChannelToast, setShowChannelToast] = useState(false);

  const handleGenerate = () => {
    if (!inputText.trim()) return;
    setShowChannelToast(true);
  };

  return (
    <>
      <Header />
      <Hero />

      <Features
        inputText={inputText}
        setInputText={setInputText}
        onGenerate={handleGenerate}
      />

      {showChannelToast && (
        <ChannelToast
          onSelect={(c) => setChannel(c)}
          onClose={() => setShowChannelToast(false)}
        />
      )}
    </>
  );
}
