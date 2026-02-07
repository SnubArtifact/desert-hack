import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToggleOn, faToggleOff, faSignature } from '@fortawesome/free-solid-svg-icons';
import "./Header.css";

const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "Tool", href: "#translator" },
];

export default function App({ theme, toggleTheme }) {
  const headerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        clearProps: "transform",
      }
    );
  }, []);

  return (
    <div className="header-wrapper">
      <header ref={headerRef} className="floating-header">
        <div className="header-left">
          <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
            <div className="brand-logo">
              <FontAwesomeIcon icon={faSignature} />
            </div>
            <div className="brand-info">
              <span className="brand-product">Formalize</span>

            </div>
          </div>

          <nav className="nav">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="nav-link">
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="header-right">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <FontAwesomeIcon icon={faToggleOff} />
            ) : (
              <FontAwesomeIcon icon={faToggleOn} style={{ color: "#ffffff" }} />
            )}
          </button>
        </div>
      </header>
    </div>
  );
}
