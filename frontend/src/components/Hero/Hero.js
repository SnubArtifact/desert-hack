import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./Hero.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const btnRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);

  const scrollToEditor = () => {
    const editor = document.getElementById('translator');
    if (editor) {
      editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    // Entrance animations
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 })
      .fromTo(
        titleRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.2"
      )
      .fromTo(
        subRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.4"
      )
      .fromTo(
        btnRef.current,
        { y: 20, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5 },
        "-=0.3"
      );

    // Floating orbs animation - subtle background movement
    gsap.to(orb1Ref.current, {
      y: -30,
      x: 15,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    gsap.to(orb2Ref.current, {
      y: 25,
      x: -20,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 0.5
    });

    gsap.to(orb3Ref.current, {
      y: -20,
      x: -10,
      duration: 3.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 1
    });

  }, []);

  return (
    <section id="hero" ref={heroRef} className="hero">
      {/* Decorative floating orbs */}
      <div ref={orb1Ref} className="hero-orb hero-orb-1"></div>
      <div ref={orb2Ref} className="hero-orb hero-orb-2"></div>
      <div ref={orb3Ref} className="hero-orb hero-orb-3"></div>

      <h1 ref={titleRef} className="hero-title">
        Don't worry. <br />
        Just <span className="hero-accent">speak.</span>
      </h1>

      <p ref={subRef} className="hero-sub">
        Formalize lets you write, think, and move faster using nothing but your voice.
      </p>

      <button ref={btnRef} className="hero-cta" onClick={scrollToEditor}>
        Try it out
        <span className="cta-arrow">→</span>
      </button>
    </section>
  );
}
