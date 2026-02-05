import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./Hero.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);


export default function Hero() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const accentRef = useRef(null);
  const underlineRef = useRef(null);
  const subRef = useRef(null);
  const actionsRef = useRef([]);
const arrowRef = useRef(null);
const bgRef = useRef(null);


  useEffect(() => {
   
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      heroRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4 }
    )
      .fromTo(
        titleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.2"
      )
      .fromTo(
        accentRef.current,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 0.6 },
        "-=0.3"
      )
      .fromTo(
        underlineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.5 },
        "-=0.4"
      )
      .fromTo(
        subRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        "-=0.3"
      )
      .fromTo(
        actionsRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.12,
        },
        "-=0.2"
      );


    gsap.to(accentRef.current, {
      backgroundPosition: "200% center",
      duration: 10,
      repeat: -1,
      ease: "linear",
    });


    gsap.to(underlineRef.current, {
      opacity: 0.4,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

gsap.to(arrowRef.current, {
  y: 8,
  duration: 1.4,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
});


gsap.to(arrowRef.current, {
  opacity: 0,
  scrollTrigger: {
    trigger: arrowRef.current,
    start: "top bottom",
    scrub: true,
  },
});

  }, []);
  const animateButton = (btn) => {
  const top = btn.querySelector(".btn-text-top");
  const bottom = btn.querySelector(".btn-text-bottom");

  if (!top || !bottom) return;

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
gsap.to(bgRef.current, {
  x: 120,
  y: -80,
  rotation: 8,
  duration: 18,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
});

gsap.to(bgRef.current, {
  opacity: 0.45,
  duration: 4,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
});
};



  return (
    <section ref={heroRef} className="hero">
       <div ref={bgRef} className="hero-bg" />
      <h1 ref={titleRef} className="hero-title">
        Don’t worry. <br />
        Just{" "}
        <span className="accent-wrap">
          <span ref={accentRef} className="hero-accent">
            speak.
          </span>
          <span ref={underlineRef} className="accent-underline" />
        </span>
      </h1>

      <p ref={subRef} className="hero-sub">
        Formalize lets you write, think, and move faster using nothing but your voice.
      </p>

    <div className="hero-actions">
  <button
    ref={(el) => (actionsRef.current[0] = el)}
    className="hero-btn primary fancy-btn"
    onMouseEnter={(e) => animateButton(e.currentTarget)}
  >
    <span className="btn-inner">
      <span className="btn-measure">Download for macOS</span>
      <span className="btn-text btn-text-top">Download for macOS</span>
      <span className="btn-text btn-text-bottom">Download for macOS</span>
    </span>
  </button>

  <button
    ref={(el) => (actionsRef.current[1] = el)}
    className="hero-btn secondary fancy-btn"
    onMouseEnter={(e) => animateButton(e.currentTarget)}
  >
    <span className="btn-inner">
      <span className="btn-measure">View Research</span>
      <span className="btn-text btn-text-top">View Research</span>
      <span className="btn-text btn-text-bottom">View Research</span>
    </span>
  </button>
</div>

      <div ref={arrowRef} className="scroll-indicator">
  <span className="arrow">↓</span>
</div>

    </section>
  );
}
