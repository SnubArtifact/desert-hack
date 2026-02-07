import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./Hero.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 })
      .fromTo(
        titleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.2"
      )
      .fromTo(
        subRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        "-=0.3"
      );
  }, []);

  return (
    <section id="hero" ref={heroRef} className="hero">
      <h1 ref={titleRef} className="hero-title">
        Don’t worry. <br />
        Just <span className="hero-accent">speak.</span>
      </h1>

      <p ref={subRef} className="hero-sub">
        Formalize lets you write, think, and move faster using nothing but your voice.
      </p>
    </section>
  );
}
