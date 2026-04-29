"use client";

import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function HomePage() {
  return (
    <div className="tn-root">

      {/* ── Google Fonts: Cormorant Garamond + DM Mono ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,600&family=DM+Mono:wght@300;400;500&family=Jost:wght@300;400;500;600&display=swap');

        /* ═══════════════════════════════════
           DESIGN TOKENS — Art Deco Noir
        ═══════════════════════════════════ */
        :root {
          --coal:      #0e0e0e;
          --charcoal:  #161616;
          --graphite:  #1e1e1e;
          --ash:       #2a2a2a;
          --smoke:     #3d3d3d;
          --ivory:     #f5f0e8;
          --ivory-dim: #c8bfa8;
          --ivory-mute:#7a7168;
          --gold:      #c9a84c;
          --gold-lt:   #e6c97a;
          --gold-dk:   #8a6a25;
          --gold-pale: rgba(201,168,76,0.08);
          --emerald:   #2d6a4f;
          --em-lt:     #52b788;
          --em-bright: #74c69d;
          --em-pale:   rgba(45,106,79,0.15);
          --border-gold: rgba(201,168,76,0.18);
          --border-ash:  rgba(255,255,255,0.07);
        }

        /* ── Reset & Base ── */
        .tn-root, .tn-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .tn-root {
          min-height: 100vh;
          background: var(--coal);
          color: var(--ivory);
          font-family: 'Jost', system-ui, sans-serif;
          font-weight: 300;
          overflow-x: hidden;
          position: relative;
        }

        /* ── Typography ── */
        .tn-display {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 1.0;
        }
        .tn-display-italic {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-weight: 300;
          letter-spacing: 0.01em;
        }
        .tn-mono {
          font-family: 'DM Mono', monospace;
          font-weight: 300;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* ── Art Deco geometric background ── */
        .tn-bg-geo {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image:
            linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .tn-bg-orb-1 {
          position: fixed;
          top: -20%;
          right: -15%;
          width: 55vw;
          height: 55vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(45,106,79,0.07) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }
        .tn-bg-orb-2 {
          position: fixed;
          bottom: 5%;
          left: -20%;
          width: 45vw;
          height: 45vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Art Deco divider ornament ── */
        .tn-ornament {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
          margin-bottom: 20px;
        }
        .tn-ornament::before,
        .tn-ornament::after {
          content: '';
          display: block;
          height: 1px;
          width: 48px;
          background: linear-gradient(90deg, transparent, var(--gold));
        }
        .tn-ornament::after {
          background: linear-gradient(90deg, var(--gold), transparent);
        }
        .tn-ornament span {
          color: var(--gold);
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          font-family: 'DM Mono', monospace;
        }

        /* ── Section label ── */
        .tn-label {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 20px;
        }
        .tn-label::before {
          content: '';
          display: block;
          width: 28px;
          height: 1px;
          background: var(--gold);
          opacity: 0.6;
        }

        /* ── Keyframes ── */
        @keyframes tn-fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes tn-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes tn-float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes tn-pulse-ring {
          0%   { transform: scale(.85); opacity: 1; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes tn-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes tn-scanline {
          0%   { top: -4px; }
          100% { top: 100%; }
        }
        @keyframes tn-grad-shift {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes tn-border-spin {
          to { transform: rotate(360deg); }
        }

        /* ── Gold shimmer text ── */
        .tn-gold-text {
          background: linear-gradient(90deg,
            var(--gold-dk) 0%, var(--gold-lt) 25%, var(--gold) 50%,
            var(--gold-lt) 75%, var(--gold-dk) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: tn-shimmer 5s linear infinite;
        }

        /* ── Cards ── */
        .tn-card {
          background: var(--graphite);
          border: 1px solid var(--border-ash);
          border-radius: 2px;
          transition: border-color 0.3s, transform 0.35s cubic-bezier(.16,1,.3,1), box-shadow 0.35s cubic-bezier(.16,1,.3,1);
        }
        .tn-card:hover {
          border-color: var(--border-gold);
          transform: translateY(-5px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(201,168,76,0.04);
        }

        /* ── Buttons ── */
        .tn-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 36px;
          background: linear-gradient(135deg, var(--emerald) 0%, #1b4332 100%);
          color: var(--ivory);
          font-family: 'Jost', sans-serif;
          font-weight: 500;
          font-size: 14px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 1px;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 0 0 1px rgba(82,183,136,0.3), 0 8px 32px rgba(0,0,0,0.4);
        }
        .tn-btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(116,198,157,0.15), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .tn-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 0 1px var(--em-lt), 0 16px 48px rgba(0,0,0,0.5); }
        .tn-btn-primary:hover::before { opacity: 1; }

        .tn-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          border: 1px solid var(--border-gold);
          color: var(--ivory-dim);
          background: transparent;
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          font-size: 14px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border-radius: 1px;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .tn-btn-ghost:hover {
          border-color: var(--gold);
          color: var(--gold-lt);
          background: var(--gold-pale);
          transform: translateY(-2px);
        }

        /* ── Stats grid ── */
        .tn-stats {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          border: 1px solid var(--border-gold);
          border-radius: 2px;
          overflow: hidden;
          max-width: 580px;
          margin: 72px auto 0;
        }
        .tn-stat-cell {
          padding: 28px 20px;
          text-align: center;
          background: var(--graphite);
          border-right: 1px solid var(--border-gold);
          position: relative;
        }
        .tn-stat-cell:last-child { border-right: none; }
        .tn-stat-cell::before {
          content: '';
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 32px; height: 2px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }

        /* ── Ticker ── */
        .tn-ticker-wrap { overflow: hidden; background: var(--charcoal); border-top: 1px solid var(--border-gold); border-bottom: 1px solid var(--border-gold); padding: 12px 0; }
        .tn-ticker-inner { display: flex; width: max-content; animation: tn-ticker 30s linear infinite; }
        .tn-ticker-inner:hover { animation-play-state: paused; }
        .tn-ticker-item { display: inline-flex; align-items: center; gap: 8px; padding: 0 36px; font-family: 'DM Mono', monospace; font-size: 11px; color: var(--ivory-mute); white-space: nowrap; }
        .tn-ticker-sep { color: var(--gold); opacity: 0.4; }

        /* ── Step cards ── */
        .tn-step-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 96px;
          font-weight: 700;
          line-height: 1;
          position: absolute;
          top: 12px; right: 20px;
          color: rgba(255,255,255,0.025);
          user-select: none;
          pointer-events: none;
        }
        .tn-step-accent {
          position: absolute;
          top: 0; left: 40px;
          width: 40px; height: 2px;
        }

        /* ── Demo block ── */
        .tn-demo-wrap {
          background: linear-gradient(135deg, var(--gold) 0%, var(--emerald) 50%, var(--gold) 100%);
          background-size: 200% 200%;
          animation: tn-grad-shift 7s ease infinite;
          border-radius: 2px;
          padding: 1px;
        }
        .tn-demo-inner {
          background: var(--charcoal);
          border-radius: 1px;
          padding: 56px;
          position: relative;
          overflow: hidden;
        }
        .tn-demo-scan {
          position: absolute;
          left: 0; right: 0;
          height: 60px;
          background: linear-gradient(transparent, rgba(82,183,136,0.04), transparent);
          animation: tn-scanline 5s linear infinite;
          pointer-events: none;
        }
        .tn-price-best {
          border: 1px solid rgba(201,168,76,0.4);
          background: rgba(201,168,76,0.04);
          border-radius: 2px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s;
        }
        .tn-price-best::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }
        .tn-price-best:hover { border-color: var(--gold); }
        .tn-price-normal {
          border: 1px solid var(--border-ash);
          background: rgba(255,255,255,0.02);
          border-radius: 2px;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: border-color 0.3s;
        }
        .tn-price-normal:hover { border-color: rgba(255,255,255,0.15); }

        /* ── Icon box ── */
        .tn-icon-box {
          width: 46px; height: 46px;
          border-radius: 2px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        /* ── Business section ── */
        .tn-biz {
          background: var(--charcoal);
          border: 1px solid var(--border-gold);
          border-radius: 2px;
          padding: 64px 56px;
          position: relative;
          overflow: hidden;
        }
        .tn-biz::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--gold) 30%, var(--em-bright) 70%, transparent);
        }
        .tn-biz-metric {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-ash);
          border-radius: 2px;
          padding: 28px 20px;
          text-align: center;
          transition: border-color 0.3s, background 0.3s;
        }
        .tn-biz-metric:hover {
          border-color: var(--border-gold);
          background: var(--gold-pale);
        }

        /* ── Testimonial ── */
        .tn-testimonial {
          background: var(--graphite);
          border: 1px solid var(--border-ash);
          border-radius: 2px;
          padding: 36px 32px;
          transition: border-color 0.35s, transform 0.35s cubic-bezier(.16,1,.3,1);
          position: relative;
          overflow: hidden;
        }
        .tn-testimonial::after {
          content: '"';
          position: absolute;
          top: -10px; right: 24px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 120px;
          color: rgba(201,168,76,0.06);
          line-height: 1;
          pointer-events: none;
        }
        .tn-testimonial:hover {
          border-color: var(--border-gold);
          transform: translateY(-5px);
        }

        /* ── Footer ── */
        .tn-footer {
          background: var(--charcoal);
          border-top: 1px solid var(--border-gold);
          padding: 72px 0 40px;
          position: relative;
        }
        .tn-footer::before {
          content: '';
          position: absolute;
          top: -1px; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold) 30%, var(--em-lt) 70%, transparent);
        }

        /* ── Live badge ── */
        .tn-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-gold);
          border-radius: 1px;
          padding: 10px 20px;
          backdrop-filter: blur(12px);
        }

        /* ── Checklist item ── */
        .tn-check {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .tn-check-dot {
          width: 20px; height: 20px;
          border-radius: 50%;
          border: 1px solid var(--em-lt);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* ── CTA section ── */
        .tn-cta {
          background: linear-gradient(135deg, var(--charcoal) 0%, var(--graphite) 100%);
          border: 1px solid var(--border-gold);
          border-radius: 2px;
          padding: 88px 48px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .tn-cta::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--gold) 30%, var(--em-bright) 70%, transparent);
        }
        .tn-cta::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }

        /* ── Utility ── */
        .tn-container { max-width: 1120px; margin: 0 auto; padding: 0 28px; width: 100%; }
        .tn-section { padding: 112px 0; }
        .tn-relative { position: relative; z-index: 1; }

        /* ── Scroll-reveal ── */
        .tn-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1); }
        .tn-reveal.visible { opacity: 1; transform: none; }

        @media (max-width: 768px) {
          .tn-stats { grid-template-columns: 1fr; }
          .tn-stat-cell { border-right: none; border-bottom: 1px solid var(--border-gold); }
          .tn-demo-inner { padding: 32px 24px; }
          .tn-biz { padding: 40px 28px; }
          .tn-cta { padding: 60px 28px; }
          .tn-demo-grid { grid-template-columns: 1fr !important; }
          .tn-biz-grid { grid-template-columns: 1fr !important; }
          .tn-step-grid { grid-template-columns: 1fr !important; }
          .tn-testimonial-grid { grid-template-columns: 1fr !important; }
          .tn-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── Ambient background ── */}
      <div className="tn-bg-geo" />
      <div className="tn-bg-orb-1" />
      <div className="tn-bg-orb-2" />

      <div className="tn-relative">
        <NavBar />

        <main>

          {/* ════════════════════════════════════════
              HERO
          ════════════════════════════════════════ */}
          <section style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: "100px",
            paddingBottom: "60px",
          }}>
            <div className="tn-container">
              <div style={{ textAlign: "center" }}>

                {/* Live badge */}
                <div style={{ animation: "tn-fade-up 0.6s ease both", marginBottom: "44px" }}>
                  <div className="tn-live-badge" style={{ display: "inline-flex" }}>
                    <span style={{ position: "relative", display: "flex" }}>
                      <span style={{
                        position: "absolute", inset: 0, borderRadius: "50%",
                        background: "rgba(82,183,136,0.5)",
                        animation: "tn-pulse-ring 2.5s cubic-bezier(.22,1,.36,1) infinite"
                      }} />
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--em-lt)", display: "block", position: "relative" }} />
                    </span>
                    <span className="tn-mono" style={{ color: "var(--ivory-dim)" }}>
                      <span style={{ color: "var(--em-bright)" }}>10,000+</span> real narxlar
                      &nbsp;·&nbsp;
                      <span style={{ color: "var(--em-bright)" }}>500+</span> restoran
                    </span>
                  </div>
                </div>

                {/* Main heading */}
                <div style={{ animation: "tn-fade-up 0.7s 0.08s ease both" }}>
                  <h1 className="tn-display" style={{
                    fontSize: "clamp(56px, 9vw, 120px)",
                    color: "var(--ivory)",
                    marginBottom: "4px",
                  }}>
                    Eng arzon narxni
                  </h1>
                  <h1 className="tn-display tn-gold-text" style={{
                    fontSize: "clamp(56px, 9vw, 120px)",
                    marginBottom: "36px",
                  }}>
                    toping ⚡
                  </h1>
                </div>

                {/* Description */}
                <p style={{
                  animation: "tn-fade-up 0.7s 0.16s ease both",
                  maxWidth: "520px",
                  margin: "0 auto 48px",
                  fontSize: "17px",
                  lineHeight: 1.8,
                  color: "var(--ivory-dim)",
                  fontWeight: 300,
                }}>
                  TopNarx — restoran va kafelardagi{" "}
                  <em className="tn-display-italic" style={{ color: "var(--gold-lt)", fontSize: "20px" }}>
                    real narxlarni solishtirish
                  </em>{" "}
                  platformasi.
                  <span style={{ display: "block", marginTop: "10px", fontSize: "14px", color: "var(--ivory-mute)" }}>
                    Mijozlar uchun tejamkorlik · Biznes egalari uchun yangi mijozlar
                  </span>
                </p>

                {/* CTA row */}
                <div style={{
                  animation: "tn-fade-up 0.7s 0.24s ease both",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "14px",
                  justifyContent: "center",
                }}>
                  <Link href="/compare" className="tn-btn-primary">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Narxlarni solishtirish
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link href="/nearby" className="tn-btn-ghost">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Yaqin atrofdagi restoranlar
                  </Link>
                </div>

                {/* Stats */}
                <div className="tn-stats">
                  {[
                    { number: "10K+", label: "Faol narxlar", icon: "💰", trend: "+25% o'sish" },
                    { number: "500+", label: "Restoranlar", icon: "🏪", trend: "O'zbekiston bo'ylab" },
                    { number: "24/7", label: "Yangilanadi", icon: "🔄", trend: "Real vaqt rejimi" },
                  ].map((stat, idx) => (
                    <div key={idx} className="tn-stat-cell">
                      <div style={{ fontSize: "28px", marginBottom: "10px" }}>{stat.icon}</div>
                      <div className="tn-display tn-gold-text" style={{ fontSize: "34px", marginBottom: "6px" }}>
                        {stat.number}
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--ivory-dim)", marginBottom: "3px" }}>
                        {stat.label}
                      </div>
                      <div className="tn-mono" style={{ color: "var(--ivory-mute)", fontSize: "10px" }}>
                        {stat.trend}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scroll indicator */}
                <div style={{
                  marginTop: "60px",
                  animation: "tn-float 2.5s ease-in-out infinite",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <span className="tn-mono" style={{ color: "var(--ivory-mute)", fontSize: "10px" }}>Ko'proq ma'lumot</span>
                  <svg width="20" height="20" fill="none" stroke="var(--gold)" strokeOpacity="0.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════
              TICKER
          ════════════════════════════════════════ */}
          <div className="tn-ticker-wrap">
            <div className="tn-ticker-inner">
              {[...Array(2)].map((_, rep) => (
                <span key={rep} style={{ display: "contents" }}>
                  {["☕ Kapuchino — 25,000 so'm", "🍕 Pizza — 45,000 so'm", "🥗 Salad — 18,000 so'm",
                    "🍜 Lagmon — 22,000 so'm", "🧃 Sharbat — 12,000 so'm",
                    "🍖 Shashlik — 38,000 so'm", "🍰 Tort — 30,000 so'm"].map((item, i) => (
                    <span key={i} className="tn-ticker-item">
                      {item} <span className="tn-ticker-sep">◆</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          {/* ════════════════════════════════════════
              HOW IT WORKS
          ════════════════════════════════════════ */}
          <section className="tn-section">
            <div className="tn-container">
              <div style={{ textAlign: "center", marginBottom: "72px" }}>
                <div className="tn-ornament"><span>Qanday ishlaydi</span></div>
                <h2 className="tn-display" style={{ fontSize: "clamp(38px, 4vw, 60px)", color: "var(--ivory)", marginBottom: "16px" }}>
                  3 oddiy qadam
                </h2>
                <p style={{ color: "var(--ivory-mute)", fontSize: "16px", maxWidth: "420px", margin: "0 auto" }}>
                  Eng arzon narxni topish bu qadar oson bo'lmagan edi
                </p>
              </div>

              <div className="tn-step-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
                {[
                  { step: "01", title: "Mahsulotni tanlang", desc: "Kafe yoki restoranda xohlagan mahsulotingizni qidiring yoki kategoriya bo'yicha izlang", icon: "🔍", detail: "500+ mahsulot", accent: "var(--em-lt)" },
                  { step: "02", title: "Narxlarni solishtiring", desc: "Turli joylardagi real narxlarni bir ekranda ko'ring va eng yaxshi variantni aniqlang", icon: "📊", detail: "Real vaqt rejimi", accent: "var(--gold)" },
                  { step: "03", title: "Eng arzonini tanlang", desc: "Eng tejamkor variantni topib, darhol yo'l oling yoki buyurtma bering", icon: "🎯", detail: "15% gacha tejamkorlik", accent: "#a78bfa" },
                ].map((item, idx) => (
                  <div key={idx} className="tn-card" style={{ padding: "40px 36px", position: "relative", overflow: "hidden" }}>
                    <div className="tn-step-num">{item.step}</div>
                    <div className="tn-step-accent" style={{ background: item.accent }} />

                    <div style={{
                      fontSize: "36px",
                      marginBottom: "20px",
                      animation: `tn-float ${4 + idx * 0.7}s ease-in-out infinite`,
                    }}>
                      {item.icon}
                    </div>

                    <div className="tn-mono" style={{ color: "var(--ivory-mute)", marginBottom: "10px" }}>
                      Qadam {item.step}
                    </div>

                    <h3 style={{
                      fontSize: "20px",
                      fontWeight: 500,
                      color: "var(--ivory)",
                      marginBottom: "12px",
                      fontFamily: "'Cormorant Garamond', serif",
                      letterSpacing: "0.01em",
                    }}>
                      {item.title}
                    </h3>

                    <p style={{ fontSize: "14px", lineHeight: 1.75, color: "var(--ivory-mute)", marginBottom: "24px" }}>
                      {item.desc}
                    </p>

                    <span style={{
                      display: "inline-block",
                      border: `1px solid ${item.accent}40`,
                      color: item.accent,
                      borderRadius: "1px",
                      padding: "5px 14px",
                      fontSize: "11px",
                      fontFamily: "'DM Mono', monospace",
                      letterSpacing: "0.08em",
                    }}>
                      {item.detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════
              LIVE DEMO
          ════════════════════════════════════════ */}
          <section style={{ paddingBottom: "112px" }}>
            <div className="tn-container">
              <div className="tn-demo-wrap">
                <div className="tn-demo-inner">
                  <div className="tn-demo-scan" />
                  <div className="tn-demo-grid" style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "56px",
                    alignItems: "center",
                    position: "relative",
                  }}>

                    {/* Left */}
                    <div>
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "rgba(82,183,136,0.1)",
                        border: "1px solid rgba(82,183,136,0.25)",
                        borderRadius: "1px",
                        padding: "8px 16px",
                        marginBottom: "24px",
                      }}>
                        <span style={{ fontSize: "14px" }}>🔥</span>
                        <span className="tn-mono" style={{ color: "var(--em-lt)", fontSize: "10px" }}>Eng mashhur taom</span>
                      </div>

                      <h3 className="tn-display" style={{ fontSize: "44px", color: "var(--ivory)", marginBottom: "8px" }}>
                        Kapuchino
                      </h3>
                      <p style={{ color: "var(--ivory-mute)", fontSize: "14px", marginBottom: "32px" }}>
                        Eng yaqin restoranlardagi real narxlar va solishtirish
                      </p>

                      <div className="tn-price-best">
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <div className="tn-icon-box" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>☕</div>
                          <div>
                            <div style={{ fontWeight: 500, color: "var(--ivory)", fontSize: "15px" }}>Tim's Coffee</div>
                            <div style={{ color: "var(--ivory-mute)", fontSize: "12px", marginTop: "2px" }}>⭐⭐⭐⭐⭐ · 250 m masofada</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="tn-display tn-gold-text" style={{ fontSize: "22px" }}>25,000 so'm</div>
                          <div className="tn-mono" style={{ color: "var(--em-bright)", fontSize: "10px", marginTop: "3px" }}>✦ Eng arzon</div>
                        </div>
                      </div>

                      <div className="tn-price-normal">
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <div className="tn-icon-box" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-ash)" }}>☕</div>
                          <div>
                            <div style={{ fontWeight: 400, color: "var(--ivory-dim)", fontSize: "15px" }}>CoffeLab</div>
                            <div style={{ color: "var(--ivory-mute)", fontSize: "12px", marginTop: "2px" }}>⭐⭐⭐⭐ · 450 m masofada</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "var(--ivory-dim)", fontWeight: 500, fontSize: "18px" }}>28,000 so'm</div>
                          <div style={{ fontSize: "11px", color: "#f87171", marginTop: "2px" }}>+3,000 so'm</div>
                        </div>
                      </div>

                      <Link href="/compare" style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "var(--gold)",
                        fontSize: "13px",
                        fontFamily: "'DM Mono', monospace",
                        letterSpacing: "0.08em",
                        textDecoration: "none",
                        marginTop: "24px",
                        transition: "color 0.2s",
                      }}>
                        Barcha narxlarni ko'rish →
                      </Link>
                    </div>

                    {/* Right — glowing price orb */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ position: "relative" }}>
                        <div style={{
                          position: "absolute",
                          inset: "-48px",
                          borderRadius: "50%",
                          background: "radial-gradient(circle, rgba(45,106,79,0.18) 0%, transparent 70%)",
                          animation: "tn-float 5s ease-in-out infinite",
                        }} />
                        <div style={{
                          position: "relative",
                          background: "linear-gradient(145deg, var(--emerald) 0%, #1b4332 100%)",
                          border: "1px solid rgba(82,183,136,0.3)",
                          borderRadius: "2px",
                          padding: "52px 44px",
                          textAlign: "center",
                          boxShadow: "0 0 80px rgba(45,106,79,0.2), 0 0 160px rgba(45,106,79,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
                          animation: "tn-float 7s ease-in-out infinite",
                        }}>
                          {/* Art Deco corner ornaments */}
                          {[["0","0"],["0","auto"],["auto","0"],["auto","auto"]].map(([t,r], i) => (
                            <div key={i} style={{
                              position: "absolute",
                              top: t !== "auto" ? "8px" : "auto",
                              bottom: t === "auto" ? "8px" : "auto",
                              left: r === "auto" ? "8px" : "auto",
                              right: r !== "auto" ? "8px" : "auto",
                              width: "16px", height: "16px",
                              borderTop: t !== "auto" ? "1px solid rgba(201,168,76,0.5)" : "none",
                              borderBottom: t === "auto" ? "1px solid rgba(201,168,76,0.5)" : "none",
                              borderLeft: r === "auto" ? "1px solid rgba(201,168,76,0.5)" : "none",
                              borderRight: r !== "auto" ? "1px solid rgba(201,168,76,0.5)" : "none",
                            }} />
                          ))}

                          <div style={{ fontSize: "52px", marginBottom: "16px" }}>☕</div>
                          <div className="tn-mono" style={{ color: "rgba(255,255,255,0.55)", marginBottom: "10px" }}>
                            Bugungi eng arzon
                          </div>
                          <div className="tn-display" style={{ fontSize: "40px", color: "#fff", lineHeight: 1 }}>
                            25,000
                          </div>
                          <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", marginBottom: "20px" }}>so'm</div>
                          <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "rgba(0,0,0,0.2)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "1px",
                            padding: "8px 16px",
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.8)",
                            fontFamily: "'DM Mono', monospace",
                            letterSpacing: "0.06em",
                          }}>
                            ⚡ 3,000 so'm tejaladi
                          </div>
                          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "10px" }}>
                            O'rtacha narxdan 15% arzon
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════
              FOR BUSINESS OWNERS
          ════════════════════════════════════════ */}
          <section className="tn-section" style={{ paddingTop: 0 }}>
            <div className="tn-container">
              <div className="tn-biz">
                <div className="tn-biz-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "56px", alignItems: "center" }}>
                  <div>
                    <div className="tn-label">Restoran egasiz?</div>
                    <h3 className="tn-display" style={{
                      fontSize: "clamp(32px, 3vw, 48px)",
                      color: "var(--ivory)",
                      marginBottom: "20px",
                    }}>
                      Yangi mijozlarni jalb qiling
                    </h3>
                    <p style={{
                      fontSize: "15px",
                      lineHeight: 1.8,
                      color: "var(--ivory-mute)",
                      marginBottom: "32px",
                    }}>
                      O'z restoraningizni TopNarx'ga qo'shing va minglab mijozlarga eng yaxshi
                      takliflaringizni ko'rsating.{" "}
                      <em className="tn-display-italic" style={{ color: "var(--gold-lt)", fontSize: "17px" }}>
                        Bepul ro'yxatdan o'ting!
                      </em>
                    </p>

                    {["Bepul boshlang'ich tarif", "Real vaqtda narx yangilash", "Keng auditoriyaga yetib borish", "Batafsil statistika"].map((item, i) => (
                      <div key={i} className="tn-check">
                        <div className="tn-check-dot">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--em-lt)" strokeWidth="2.5">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span style={{ fontSize: "14px", color: "var(--ivory-dim)" }}>{item}</span>
                      </div>
                    ))}

                    <div style={{ display: "flex", gap: "14px", marginTop: "36px", flexWrap: "wrap" }}>
                      <Link href="/login" className="tn-btn-primary">
                        Biznes ro'yxatdan o'tish
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                      <Link href="/login" className="tn-btn-ghost">Batafsil ma'lumot</Link>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    {[
                      { icon: "📈", val: "+40%", label: "Mijozlar ko'payishi" },
                      { icon: "⭐", val: "4.8", label: "O'rtacha reyting" },
                      { icon: "👥", val: "10K+", label: "Oyiga ko'rishlar" },
                      { icon: "💚", val: "Bepul", label: "Boshlang'ich tarif" },
                    ].map((m, i) => (
                      <div key={i} className="tn-biz-metric">
                        <div style={{ fontSize: "28px", marginBottom: "12px" }}>{m.icon}</div>
                        <div className="tn-display tn-gold-text" style={{ fontSize: "26px", marginBottom: "6px" }}>{m.val}</div>
                        <div style={{ fontSize: "12px", color: "var(--ivory-mute)", lineHeight: 1.4 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════
              TESTIMONIALS
          ════════════════════════════════════════ */}
          <section className="tn-section" style={{ paddingTop: 0 }}>
            <div className="tn-container">
              <div style={{ textAlign: "center", marginBottom: "64px" }}>
                <div className="tn-ornament"><span>Ishonch va sifat</span></div>
                <h2 className="tn-display" style={{ fontSize: "clamp(32px, 4vw, 52px)", color: "var(--ivory)", marginBottom: "12px" }}>
                  Foydalanuvchilar nima deyishadi?
                </h2>
                <p style={{ color: "var(--ivory-mute)", fontSize: "14px" }}>
                  1000+ foydalanuvchi har kuni eng arzon narxlarni topmoqda
                </p>
              </div>

              <div className="tn-testimonial-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
                {[
                  { name: "Sarvar", role: "Mijoz", text: "TopNarx orqali sevimli kofeimni 5000 so'm arzonroq topdim! Juda qulay va tezkor platforma.", rating: 5, avatar: "😊", initials: "SA" },
                  { name: "Dilnoza", role: "Restoran egasi", text: "Bizning restoran narxlarimizni qo'shganimizdan keyin mijozlar soni 30% ga oshdi. Juda samarali!", rating: 5, avatar: "👩‍💼", initials: "DM" },
                  { name: "Jasur", role: "Mijoz", text: "Har kuni ishlataman. Eng yaqin va arzon joylarni topish juda oson. Tejab qolgan pulimga yana bir kofe ichaman!", rating: 5, avatar: "👨‍💻", initials: "JK" },
                ].map((t, idx) => (
                  <div key={idx} className="tn-testimonial">
                    <div style={{ color: "var(--gold)", fontSize: "16px", letterSpacing: "3px", marginBottom: "20px" }}>
                      {"★".repeat(t.rating)}
                    </div>
                    <p style={{
                      fontSize: "15px",
                      lineHeight: 1.8,
                      color: "var(--ivory-dim)",
                      marginBottom: "28px",
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: "italic",
                      fontWeight: 300,
                    }}>
                      "{t.text}"
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{
                        width: "42px", height: "42px",
                        borderRadius: "50%",
                        background: "rgba(201,168,76,0.08)",
                        border: "1px solid rgba(201,168,76,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--gold)",
                        fontFamily: "'DM Mono', monospace",
                        letterSpacing: "0.05em",
                      }}>
                        {t.initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: "14px", color: "var(--ivory)" }}>{t.name}</div>
                        <div className="tn-mono" style={{ color: "var(--ivory-mute)", fontSize: "10px" }}>{t.role}</div>
                      </div>
                      <div style={{
                        marginLeft: "auto",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "10px",
                        color: "var(--em-lt)",
                        fontFamily: "'DM Mono', monospace",
                        letterSpacing: "0.05em",
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                        Tasdiqlangan
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════
              FINAL CTA
          ════════════════════════════════════════ */}
          <section style={{ paddingBottom: "112px" }}>
            <div className="tn-container">
              <div className="tn-cta">
                {/* Art Deco corner lines */}
                <div style={{ position: "absolute", top: 20, left: 20, width: 40, height: 40, borderTop: "1px solid var(--border-gold)", borderLeft: "1px solid var(--border-gold)" }} />
                <div style={{ position: "absolute", top: 20, right: 20, width: 40, height: 40, borderTop: "1px solid var(--border-gold)", borderRight: "1px solid var(--border-gold)" }} />
                <div style={{ position: "absolute", bottom: 20, left: 20, width: 40, height: 40, borderBottom: "1px solid var(--border-gold)", borderLeft: "1px solid var(--border-gold)" }} />
                <div style={{ position: "absolute", bottom: 20, right: 20, width: 40, height: 40, borderBottom: "1px solid var(--border-gold)", borderRight: "1px solid var(--border-gold)" }} />

                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "68px", height: "68px",
                  background: "linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.05) 100%)",
                  border: "1px solid rgba(201,168,76,0.35)",
                  borderRadius: "2px",
                  fontSize: "32px",
                  marginBottom: "32px",
                  animation: "tn-float 4s ease-in-out infinite",
                }}>
                  💰
                </div>

                <h2 className="tn-display" style={{
                  fontSize: "clamp(36px, 5vw, 64px)",
                  color: "var(--ivory)",
                  marginBottom: "20px",
                }}>
                  Eng arzon narxni topishga tayyormisiz?
                </h2>

                <p style={{
                  fontSize: "16px",
                  lineHeight: 1.8,
                  color: "var(--ivory-mute)",
                  maxWidth: "480px",
                  margin: "0 auto 48px",
                  fontWeight: 300,
                }}>
                  Hozir boshlang va sevimli taomlaringizni eng arzon narxlarda xarid qiling.
                  <br />
                  <em className="tn-display-italic" style={{ color: "var(--gold-lt)", fontSize: "18px" }}>
                    Ro'yxatdan o'tish 1 daqiqa, butunlay bepul.
                  </em>
                </p>

                <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/login" className="tn-btn-primary" style={{ fontSize: "14px", padding: "17px 40px" }}>
                    Boshlash (bepul)
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link href="/compare" className="tn-btn-ghost">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Demo ko'rish
                  </Link>
                </div>

                {/* Trust signals */}
                <div style={{
                  display: "flex",
                  gap: "32px",
                  justifyContent: "center",
                  marginTop: "52px",
                  flexWrap: "wrap"
                }}>
                  {["🔒 Xavfsiz", "⚡ Tezkor", "🎯 Aniq narxlar", "💳 Karta shart emas"].map((item, i) => (
                    <span key={i} className="tn-mono" style={{ color: "var(--ivory-mute)", fontSize: "10px" }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

        </main>

        {/* ════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════ */}
        <footer className="tn-footer">
          <div className="tn-container">
            <div className="tn-footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "48px", marginBottom: "52px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{
                    width: "36px", height: "36px",
                    background: "linear-gradient(135deg, var(--emerald) 0%, #1b4332 100%)",
                    border: "1px solid rgba(82,183,136,0.3)",
                    borderRadius: "2px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "18px",
                  }}>💰</div>
                  <span className="tn-display" style={{ fontSize: "24px", color: "var(--ivory)" }}>TopNarx</span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--ivory-mute)", lineHeight: 1.7, maxWidth: "220px" }}>
                  Eng arzon narxlarni topish platformasi. O'zbekiston restoranlarining eng katta narxlar bazasi.
                </p>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  {["📱", "💬", "📧"].map((icon, i) => (
                    <a key={i} href="#" style={{
                      width: "34px", height: "34px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--border-ash)",
                      borderRadius: "2px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "15px",
                      textDecoration: "none",
                      transition: "border-color 0.2s, background 0.2s",
                    }}>
                      {icon}
                    </a>
                  ))}
                </div>
              </div>

              {[
                { title: "Foydalanuvchilar", links: [{ label: "Narxlarni solishtirish", href: "/compare" }, { label: "Yaqin restoranlar", href: "/nearby" }, { label: "Eng mashhur taomlar", href: "/login" }] },
                { title: "Biznes egalari", links: [{ label: "Restoran qo'shish", href: "/login" }, { label: "Tariflar", href: "/login" }, { label: "Reklama joylashtirish", href: "/login" }] },
                { title: "Qo'llab-quvvatlash", links: [{ label: "Bog'lanish", href: "/login" }, { label: "Savol-javoblar", href: "/login" }, { label: "Qoidalar", href: "/login" }] },
              ].map((col, i) => (
                <div key={i}>
                  <h4 style={{
                    fontSize: "11px",
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    marginBottom: "18px",
                    fontWeight: 400,
                  }}>
                    {col.title}
                  </h4>
                  <ul style={{ listStyle: "none" }}>
                    {col.links.map((link, j) => (
                      <li key={j} style={{ marginBottom: "10px" }}>
                        <Link href={link.href} style={{
                          fontSize: "13px",
                          color: "var(--ivory-mute)",
                          textDecoration: "none",
                          transition: "color 0.2s",
                          fontWeight: 300,
                        }}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{
              borderTop: "1px solid var(--border-gold)",
              paddingTop: "28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}>
              <p className="tn-mono" style={{ color: "var(--ivory-mute)", fontSize: "10px" }}>
                © 2026 TopNarx. Barcha huquqlar himoyalangan.
              </p>
              <p className="tn-mono" style={{ color: "var(--ivory-mute)", fontSize: "10px" }}>
                Azizbek Abdunazarov tomonidan qilingan dastur
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Scroll-reveal */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          var els = document.querySelectorAll('.tn-reveal');
          var obs = new IntersectionObserver(function(entries){
            entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
          }, { threshold: 0.12 });
          els.forEach(function(el){ obs.observe(el); });
        })();
      `}} />
    </div>
  );
}