import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import InputSection from "../Input/InputSection";
import "./Features.css";

gsap.registerPlugin(ScrollTrigger);

export default function Features({
  inputText,
  setInputText,
  onGenerate, 
}) {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        once: true,
      },
      defaults: { ease: "power3.out" },
    });

    tl.fromTo(sectionRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
      .fromTo(
        titleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.1"
      )
      .fromTo(
        inputRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        "-=0.1"
      );
  }, []);

  return (
    <section ref={sectionRef} className="features">
      <h2 ref={titleRef} className="features-title">
        Try it out
      </h2>

      <div ref={inputRef} className="features-input">
       <InputSection
  value={inputText}
  onChange={setInputText}
  onGenerate={onGenerate}
/>

      </div>
    </section>
  );
}
