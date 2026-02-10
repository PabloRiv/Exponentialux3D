"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HeroOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ========== Hero entrance ==========
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

      heroTl
        .from("[data-animate='badge']", {
          y: -30,
          opacity: 0,
          duration: 0.8,
          delay: 0.6,
        })
        .from(
          "[data-animate='heading'] span",
          { y: 80, opacity: 0, duration: 1, stagger: 0.12 },
          "-=0.3"
        )
        .from(
          "[data-animate='subtext']",
          { y: 30, opacity: 0, duration: 0.8 },
          "-=0.4"
        )
        .from(
          "[data-animate='cta'] > *",
          { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 },
          "-=0.3"
        )
        .from(
          "[data-animate='scroll-hint']",
          { opacity: 0, y: 10, duration: 1 },
          "-=0.2"
        );

      // ========== Hero parallax on scroll ==========
      gsap.to("#section-hero .hero-content", {
        y: -120,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: "#section-hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // ========== Features section ==========
      gsap.from("#section-features .section-label", {
        x: -80,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: "#section-features",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from("#section-features .section-heading", {
        y: 60,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: "#section-features",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      // Feature cards stagger
      gsap.from("#section-features .feature-card", {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#section-features .feature-grid",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      // Feature card glow lines animate in
      gsap.from("#section-features .feature-card .glow-line", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#section-features .feature-grid",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // ========== Showcase section ==========
      gsap.from("#section-showcase .section-label", {
        x: -80,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: "#section-showcase",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from("#section-showcase .section-heading", {
        y: 60,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: "#section-showcase",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      // Showcase items slide in alternating
      document.querySelectorAll(".showcase-item").forEach((item, i) => {
        gsap.from(item, {
          x: i % 2 === 0 ? -120 : 120,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // Number counters
      document.querySelectorAll(".counter-value").forEach((el) => {
        const target = parseInt(el.getAttribute("data-value") || "0");
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          onUpdate: () => {
            el.textContent = Math.round(obj.val).toLocaleString();
          },
        });
      });

      // ========== CTA section ==========
      gsap.from("#section-cta .cta-content > *", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#section-cta",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      // Floating orbs in CTA
      gsap.to(".cta-orb-1", {
        y: -30,
        x: 20,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".cta-orb-2", {
        y: 25,
        x: -15,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // ========== Horizontal reveal lines ==========
      gsap.utils.toArray<HTMLElement>(".reveal-line").forEach((line) => {
        gsap.from(line, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.5,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: line,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative z-10">
      {/* ==================== HERO ==================== */}
      <section
        id="section-hero"
        className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <div className="hero-content flex flex-col items-center">
          <div
            data-animate="badge"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
          >
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-sm font-medium text-indigo-300 tracking-wide">
              Now in 3D
            </span>
          </div>

          <h1
            data-animate="heading"
            className="max-w-4xl text-5xl font-bold leading-tight tracking-tight text-white sm:text-7xl md:text-8xl"
          >
            <span className="inline-block">ExponentialUX</span>{" "}
            <span className="inline-block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Sales
            </span>{" "}
            <span className="inline-block">Systems</span>
          </h1>

          <p
            data-animate="subtext"
            className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400 sm:text-xl"
          >
            Crafting immersive digital experiences where design meets dimension.
            We push the boundaries of what&apos;s possible on the web.
          </p>

          <div
            data-animate="cta"
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-indigo-600 px-8 font-medium text-white transition-all hover:bg-indigo-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
            <button className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-8 font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-white/30 hover:text-white">
              Learn More
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          data-animate="scroll-hint"
          className="absolute bottom-10 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Scroll
          </span>
          <div className="h-10 w-[1px] bg-gradient-to-b from-zinc-500 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section
        id="section-features"
        className="relative min-h-screen px-6 py-32 flex flex-col items-center justify-center"
      >
        <span className="section-label mb-4 inline-block text-sm font-medium uppercase tracking-[0.3em] text-indigo-400">
          What We Do
        </span>
        <h2 className="section-heading mb-4 max-w-2xl text-center text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          Built for the{" "}
          <span className="bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
            future
          </span>
        </h2>
        <p className="section-heading mb-16 max-w-lg text-center text-zinc-400">
          Every pixel is placed with purpose. Every interaction is designed to delight.
        </p>

        <div className="reveal-line mb-16 h-[1px] w-full max-w-4xl bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        <div className="feature-grid grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: "01",
              title: "3D Experiences",
              desc: "Immersive WebGL environments with real-time rendering and physics-based materials.",
              color: "from-indigo-500 to-purple-500",
            },
            {
              icon: "02",
              title: "Motion Design",
              desc: "Fluid animations powered by GSAP with scroll-driven storytelling.",
              color: "from-pink-500 to-rose-500",
            },
            {
              icon: "03",
              title: "Interactive UI",
              desc: "Gesture-responsive interfaces that feel natural and intuitive.",
              color: "from-cyan-500 to-blue-500",
            },
            {
              icon: "04",
              title: "Performance",
              desc: "60fps experiences optimized with instanced rendering and LOD systems.",
              color: "from-amber-500 to-orange-500",
            },
            {
              icon: "05",
              title: "Spatial Audio",
              desc: "3D positional sound design that creates true immersion.",
              color: "from-emerald-500 to-teal-500",
            },
            {
              icon: "06",
              title: "Cross-Platform",
              desc: "Experiences that adapt seamlessly from mobile to desktop to VR.",
              color: "from-violet-500 to-fuchsia-500",
            },
          ].map((feature) => (
            <div
              key={feature.icon}
              className="feature-card group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div
                className={`glow-line mb-6 h-[2px] w-12 bg-gradient-to-r ${feature.color}`}
              />
              <span
                className={`mb-4 inline-block bg-gradient-to-r ${feature.color} bg-clip-text text-3xl font-bold text-transparent`}
              >
                {feature.icon}
              </span>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                {feature.desc}
              </p>
              {/* Hover glow */}
              <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-indigo-500/5 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>

      {/* ==================== SHOWCASE ==================== */}
      <section
        id="section-showcase"
        className="relative min-h-screen px-6 py-32 flex flex-col items-center justify-center"
      >
        <span className="section-label mb-4 inline-block text-sm font-medium uppercase tracking-[0.3em] text-pink-400">
          By the Numbers
        </span>
        <h2 className="section-heading mb-20 max-w-3xl text-center text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          Proven at{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            scale
          </span>
        </h2>

        {/* Stats row */}
        <div className="mb-20 grid w-full max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: "10000", suffix: "+", label: "Users Active" },
            { value: "99", suffix: "%", label: "Uptime SLA" },
            { value: "150", suffix: "ms", label: "Avg. Response" },
            { value: "4", suffix: ".9", label: "User Rating" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="showcase-item text-center"
            >
              <p className="text-4xl font-bold text-white sm:text-5xl">
                <span
                  className="counter-value"
                  data-value={stat.value}
                >
                  0
                </span>
                <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                  {stat.suffix}
                </span>
              </p>
              <p className="mt-2 text-sm text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="reveal-line mb-20 h-[1px] w-full max-w-4xl bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />

        {/* Showcase items */}
        <div className="flex w-full max-w-4xl flex-col gap-16">
          {[
            {
              title: "Real-Time Collaboration",
              desc: "Multi-user 3D workspaces where teams can co-create in real time. Changes propagate instantly across all connected sessions with sub-100ms latency.",
              tag: "FLAGSHIP",
            },
            {
              title: "AI-Powered Generation",
              desc: "Natural language to 3D scene generation. Describe your vision and watch it materialize with physically accurate materials and lighting.",
              tag: "NEW",
            },
            {
              title: "Adaptive Performance",
              desc: "Intelligent LOD systems that dynamically adjust geometry complexity, texture resolution, and effect quality to maintain 60fps on any device.",
              tag: "CORE",
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className={`showcase-item flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-8 ${
                i % 2 === 1 ? "sm:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1">
                <span className="mb-3 inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                  {item.tag}
                </span>
                <h3 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                  {item.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
              <div className="h-[1px] w-full bg-gradient-to-r from-indigo-500/20 to-pink-500/20 sm:h-32 sm:w-[1px] sm:bg-gradient-to-b" />
              <div className="flex flex-1 items-center justify-center">
                <div className="h-40 w-40 rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-500/10 to-pink-500/10" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section
        id="section-cta"
        className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <div className="cta-content relative flex flex-col items-center">
          {/* Decorative orbs */}
          <div className="cta-orb-1 absolute -left-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="cta-orb-2 absolute -bottom-20 -right-20 h-32 w-32 rounded-full bg-pink-500/10 blur-3xl" />

          <span className="mb-6 inline-block text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
            Ready to Launch?
          </span>
          <h2 className="mb-6 max-w-3xl text-4xl font-bold text-white sm:text-6xl md:text-7xl">
            Let&apos;s build something{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              extraordinary
            </span>
          </h2>
          <p className="mb-10 max-w-lg text-lg text-zinc-400">
            Transform your digital presence with experiences that captivate,
            engage, and convert.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <button className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-10 text-lg font-medium text-white transition-all hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]">
              <span className="relative z-10">Start Your Project</span>
            </button>
            <button className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 px-10 text-lg font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-white/30 hover:text-white">
              Book a Demo
            </button>
          </div>

          <div className="mt-20 flex gap-8 text-zinc-600 text-sm">
            <span>No credit card required</span>
            <span className="text-zinc-700">|</span>
            <span>14-day free trial</span>
            <span className="text-zinc-700">|</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-20" />
    </div>
  );
}
