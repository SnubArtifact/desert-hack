import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./Header.css";

const NAV_ITEMS = {
  Product: [
    ["Features", "Do more with your voice"],
    ["Pricing", "14-day free trial"],
    ["Android Waitlist", "Early access"],
  ],
  Individuals: [
    ["Personal Use", "For everyday writing"],
    ["Accessibility", "Hands-free typing"],
  ],
  Business: [
    ["Teams", "Collaborate efficiently"],
    ["Enterprise", "Custom solutions"],
  ],
  Resources: [
    ["Blog", "Latest updates"],
    ["Docs", "Developer documentation"],
  ],
};

export default function App({ theme, toggleTheme }) {
  const headerRef = useRef(null);
  const dropdownRef = useRef(null);
  const closeTimeout = useRef(null);

  const [activeMenu, setActiveMenu] = useState(null);


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


  useEffect(() => {
    if (!dropdownRef.current) return;

    gsap.fromTo(
      dropdownRef.current,
      { opacity: 0, y: -8, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.25,
        ease: "power2.out",
      }
    );
  }, [activeMenu]);

  const openMenu = (menu) => {
    clearTimeout(closeTimeout.current);
    setActiveMenu(menu);
  };

  const closeMenu = () => {
    closeTimeout.current = setTimeout(() => {
      setActiveMenu(null);
    }, 120);
  };
  const animateButton = (btn) => {
    const top = btn.querySelector(".btn-text-top");
    const bottom = btn.querySelector(".btn-text-bottom");

    gsap.killTweensOf([top, bottom]);

    gsap.fromTo(
      top,
      { y: 0, opacity: 1 },
      { y: -12, opacity: 0, duration: 0.2, ease: "power2.out" }
    );

    gsap.fromTo(
      bottom,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.25, ease: "power2.out", delay: 0.05 }
    );
  };

  return (
    <div className="header-wrapper">
      <header ref={headerRef} className="floating-header">
        <div className="header-left">
          <div className="brand">
            <span className="brand-product">Formalize</span>
            <span className="brand-team">by Teamname</span>
          </div>


          <nav className="nav">
            {Object.keys(NAV_ITEMS).map((item) => (
              <div
                key={item}
                className="nav-item"
                onMouseEnter={() => openMenu(item)}
                onMouseLeave={closeMenu}
              >
                <button className="nav-trigger">
                  {item} <span className="chevron">▾</span>
                </button>

                {activeMenu === item && (
                  <div
                    ref={dropdownRef}
                    className="dropdown"
                    onMouseEnter={() => openMenu(item)}
                    onMouseLeave={closeMenu}
                  >
                    {NAV_ITEMS[item].map(([title, desc]) => (
                      <div key={title} className="dropdown-item">
                        <strong>{title}</strong>
                        <span>{desc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="header-right">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <button
            className="outline-btn fancy-btn"
            onMouseEnter={(e) => animateButton(e.currentTarget)}
          >
            <span className="btn-inner">
              { }
              <span className="btn-measure">Research</span>

              { }
              <span className="btn-text btn-text-top">Research</span>
              <span className="btn-text btn-text-bottom">Research</span>
            </span>
          </button>


          <button
            className="primary-btn fancy-btn"
            onMouseEnter={(e) => animateButton(e.currentTarget)}
          >
            <span className="btn-inner">
              <span className="btn-measure">Download for macOS</span>
              <span className="btn-text btn-text-top">Download for macOS</span>
              <span className="btn-text btn-text-bottom">Download for macOS</span>
            </span>
          </button>

        </div>


      </header>
    </div>
  );
}
