import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./ChannelToast.css";

const CHANNELS = [
  { id: "email", label: "Email" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "linkedin", label: "LinkedIn Post" },
];

export default function ChannelToast({ onSelect, onClose }) {
  const toastRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      toastRef.current,
      { y: 24, opacity: 0, scale: 0.98 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.35,
        ease: "power3.out",
      }
    );
  }, []);

  const handleSelect = (channel) => {
    gsap.to(toastRef.current, {
      y: 24,
      opacity: 0,
      scale: 0.98,
      duration: 0.25,
      ease: "power3.in",
      onComplete: () => {
        onSelect(channel);
        onClose();
      },
    });
  };

  return (
    <div className="channel-toast" ref={toastRef}>
      <div className="toast-title">Use this as</div>

      <div className="toast-options">
        {CHANNELS.map((c) => (
          <button
            key={c.id}
            className="toast-btn"
            onClick={() => handleSelect(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
