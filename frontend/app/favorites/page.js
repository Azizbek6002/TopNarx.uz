// frontend/app/favourites/page.js

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { getFavorites, toggleFavorite } from "@/lib/favorites";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    setFavorites(getFavorites());
  };

  const handleRemove = (itemId) => {
    const newFavorites = toggleFavorite({ id: itemId });
    setFavorites(newFavorites);
    setShowConfirmModal(false);
    setItemToRemove(null);
  };

  const confirmRemove = (item) => {
    setItemToRemove(item);
    setShowConfirmModal(true);
  };

  const restaurantFavorites = favorites.filter((f) => f.type === "restaurant");
  const variantFavorites = favorites.filter((f) => f.type === "variant");

  let displayedFavorites =
    activeTab === "all"
      ? favorites
      : activeTab === "restaurants"
      ? restaurantFavorites
      : variantFavorites;

  if (searchTerm.trim()) {
    displayedFavorites = displayedFavorites.filter((fav) => {
      if (fav.type === "restaurant")
        return (
          fav.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fav.address?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      return (
        fav.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  const getGoogleMapsUrl = (lat, lng) =>
    `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  const tabs = [
    { id: "all", label: "Hammasi", icon: "◈", count: favorites.length },
    { id: "restaurants", label: "Restoranlar", icon: "🏪", count: restaurantFavorites.length },
    { id: "variants", label: "Mahsulotlar", icon: "🍽️", count: variantFavorites.length },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,600&family=DM+Mono:wght@300;400&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --np-coal:        #0e0e0e;
          --np-charcoal:    #161616;
          --np-graphite:    #1e1e1e;
          --np-ash:         #2a2a2a;
          --np-ivory:       #f5f0e8;
          --np-ivory-dim:   #c8bfa8;
          --np-ivory-mute:  #7a7168;
          --np-gold:        #c9a84c;
          --np-gold-lt:     #e6c97a;
          --np-gold-dk:     #8a6a25;
          --np-gold-pale:   rgba(201,168,76,0.07);
          --np-emerald:     #2d6a4f;
          --np-em-lt:       #52b788;
          --np-em-bright:   #74c69d;
          --np-crimson:     #c0392b;
          --np-crimson-lt:  #e74c3c;
          --np-border-gold: rgba(201,168,76,0.18);
          --np-border-ash:  rgba(255,255,255,0.07);
        }

        .fv-root {
          min-height: 100vh;
          background: var(--np-coal);
          color: var(--np-ivory);
          font-family: 'Jost', system-ui, sans-serif;
          font-weight: 300;
          position: relative;
          overflow-x: hidden;
        }

        /* ── background ── */
        .fv-bg-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(201,168,76,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.022) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .fv-bg-orb-1 { position:fixed; top:-20%; right:-15%; width:55vw; height:55vw; border-radius:50%; background:radial-gradient(circle,rgba(45,106,79,0.07) 0%,transparent 65%); pointer-events:none; z-index:0; }
        .fv-bg-orb-2 { position:fixed; bottom:5%; left:-20%; width:42vw; height:42vw; border-radius:50%; background:radial-gradient(circle,rgba(201,168,76,0.05) 0%,transparent 65%); pointer-events:none; z-index:0; }

        /* ── typography ── */
        .fv-display { font-family:'Cormorant Garamond',Georgia,serif; font-weight:600; letter-spacing:-0.01em; }
        .fv-mono    { font-family:'DM Mono',monospace; font-weight:300; letter-spacing:0.14em; text-transform:uppercase; }

        /* ── cards ── */
        .fv-card {
          background: var(--np-charcoal);
          border: 1px solid var(--np-border-ash);
          border-radius: 2px;
          position: relative; overflow: hidden;
        }
        .fv-card-gold {
          background: var(--np-charcoal);
          border: 1px solid var(--np-border-gold);
          border-radius: 2px;
          position: relative; overflow: hidden;
        }
        .fv-card-gold::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,var(--np-gold) 30%,var(--np-em-bright) 70%,transparent);
        }

        /* ── art-deco corners ── */
        .fv-corners::before, .fv-corners::after,
        .fv-corners > .fcc-bl, .fv-corners > .fcc-br {
          content:''; position:absolute; width:16px; height:16px; pointer-events:none;
        }
        .fv-corners::before { top:10px; left:10px;   border-top:1px solid var(--np-border-gold); border-left:1px solid var(--np-border-gold); }
        .fv-corners::after  { top:10px; right:10px;  border-top:1px solid var(--np-border-gold); border-right:1px solid var(--np-border-gold); }
        .fv-corners > .fcc-bl { bottom:10px; left:10px;  border-bottom:1px solid var(--np-border-gold); border-left:1px solid var(--np-border-gold); }
        .fv-corners > .fcc-br { bottom:10px; right:10px; border-bottom:1px solid var(--np-border-gold); border-right:1px solid var(--np-border-gold); }

        /* ── ornament divider ── */
        .fv-ornament { display:flex; align-items:center; gap:10px; margin-bottom:0; }
        .fv-ornament::before,.fv-ornament::after { content:''; display:block; height:1px; width:28px; }
        .fv-ornament::before { background:linear-gradient(90deg,transparent,var(--np-gold)); }
        .fv-ornament::after  { background:linear-gradient(90deg,var(--np-gold),transparent); }
        .fv-ornament span { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:var(--np-gold); opacity:0.7; }

        /* ── badges ── */
        .fv-badge {
          display:inline-flex; align-items:center; gap:5px;
          border-radius:1px; padding:4px 11px;
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase;
        }
        .fv-badge-em   { background:rgba(82,183,136,0.1); border:1px solid rgba(82,183,136,0.25); color:var(--np-em-bright); }
        .fv-badge-gold { background:var(--np-gold-pale); border:1px solid rgba(201,168,76,0.25); color:var(--np-gold-lt); }
        .fv-badge-gray { background:rgba(255,255,255,0.04); border:1px solid var(--np-border-ash); color:var(--np-ivory-mute); }
        .fv-badge-blue { background:rgba(96,165,250,0.08); border:1px solid rgba(96,165,250,0.2); color:#93c5fd; }
        .fv-badge-crimson { background:rgba(192,57,43,0.1); border:1px solid rgba(192,57,43,0.25); color:#f87171; }

        /* ── stat cards ── */
        .fv-stat {
          background: var(--np-charcoal);
          border: 1px solid var(--np-border-ash);
          border-radius: 2px;
          padding: 24px 28px;
          position: relative; overflow: hidden;
          transition: border-color 0.25s;
        }
        .fv-stat::before {
          content:''; position:absolute; bottom:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, transparent, var(--np-gold), transparent);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .fv-stat:hover { border-color: var(--np-border-gold); }
        .fv-stat:hover::before { opacity: 1; }

        /* ── tab buttons ── */
        .fv-tab {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 20px;
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.12em; text-transform:uppercase;
          border: none; background: transparent;
          color: var(--np-ivory-mute);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: color 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .fv-tab:hover { color: var(--np-ivory-dim); }
        .fv-tab.active {
          color: var(--np-gold-lt);
          border-bottom-color: var(--np-gold);
        }

        /* ── search input ── */
        .fv-search-wrap { position: relative; }
        .fv-search {
          width: 240px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--np-border-ash);
          border-radius: 1px;
          padding: 9px 14px 9px 36px;
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.1em;
          color: var(--np-ivory-dim);
          outline: none;
          transition: border-color 0.22s;
        }
        .fv-search::placeholder { color: var(--np-ivory-mute); }
        .fv-search:focus { border-color: var(--np-border-gold); }
        .fv-search-icon {
          position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
          color: var(--np-ivory-mute); pointer-events: none;
        }
        .fv-clear {
          padding: 9px 14px;
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase;
          background: rgba(255,255,255,0.03); border: 1px solid var(--np-border-ash); border-radius:1px;
          color: var(--np-ivory-mute); cursor: pointer;
          transition: all 0.22s;
        }
        .fv-clear:hover { border-color: var(--np-border-gold); color: var(--np-gold-lt); }

        /* ── favorite rows ── */
        .fv-row {
          padding: 24px 32px;
          border-bottom: 1px solid var(--np-border-ash);
          display: flex; align-items: flex-start; justify-content: space-between; gap: 20px;
          transition: background 0.2s;
          position: relative;
        }
        .fv-row:last-child { border-bottom: none; }
        .fv-row::before {
          content:''; position:absolute; left:0; top:0; bottom:0; width:2px;
          background: transparent; transition: background 0.25s;
        }
        .fv-row:hover { background: rgba(201,168,76,0.025); }
        .fv-row:hover::before { background: linear-gradient(180deg,transparent,var(--np-gold),transparent); }

        /* ── icon box ── */
        .fv-icon-box {
          width:44px; height:44px; border-radius:2px; flex-shrink:0;
          background:rgba(255,255,255,0.03); border:1px solid var(--np-border-ash);
          display:flex; align-items:center; justify-content:center;
          font-size:20px; transition: border-color 0.25s;
        }
        .fv-row:hover .fv-icon-box { border-color: var(--np-border-gold); }

        /* ── action buttons ── */
        .fv-action {
          width:36px; height:36px; border-radius:1px;
          display:flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,0.03); border:1px solid var(--np-border-ash);
          cursor:pointer; transition:all 0.22s; color:var(--np-ivory-mute);
          flex-shrink:0; text-decoration:none;
        }
        .fv-action:hover { border-color: var(--np-border-gold); color: var(--np-gold-lt); background: var(--np-gold-pale); }
        .fv-action.map-btn:hover { border-color:rgba(96,165,250,0.4); color:#93c5fd; background:rgba(96,165,250,0.07); }
        .fv-action.del-btn:hover { border-color:rgba(248,113,113,0.4); color:#f87171; background:rgba(248,113,113,0.07); }
        .fv-action.link-btn:hover { border-color:rgba(82,183,136,0.4); color:var(--np-em-bright); background:rgba(82,183,136,0.07); }

        /* ── meta pill ── */
        .fv-pill {
          display:inline-flex; align-items:center; gap:5px;
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.1em;
          color:var(--np-ivory-mute); background:rgba(255,255,255,0.03);
          border:1px solid var(--np-border-ash); border-radius:1px; padding:3px 10px;
        }

        /* ── empty state ── */
        .fv-empty { padding:72px 24px; text-align:center; }

        /* ── tip ── */
        .fv-tip {
          background:var(--np-graphite); border:1px solid var(--np-border-ash);
          border-radius:2px; padding:20px 24px;
          display:flex; align-items:flex-start; gap:14px;
          margin-top:20px;
        }

        /* ── modal ── */
        .fv-modal-overlay {
          position:fixed; inset:0; z-index:50;
          display:flex; align-items:center; justify-content:center; padding:16px;
          background:rgba(0,0,0,0.7);
          backdrop-filter:blur(4px);
          animation: fv-fade-in 0.2s ease;
        }
        .fv-modal {
          background: var(--np-charcoal);
          border: 1px solid var(--np-border-gold);
          border-radius: 2px;
          max-width: 440px; width: 100%;
          padding: 40px;
          position: relative;
          animation: fv-scale-in 0.2s cubic-bezier(.16,1,.3,1);
        }
        .fv-modal::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,var(--np-crimson-lt) 40%,var(--np-gold) 70%,transparent);
        }
        .fv-modal-btn {
          flex:1; padding:10px 20px; border-radius:1px; cursor:pointer;
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.14em; text-transform:uppercase;
          transition:all 0.22s;
        }
        .fv-modal-btn.cancel {
          background:rgba(255,255,255,0.03); border:1px solid var(--np-border-ash); color:var(--np-ivory-mute);
        }
        .fv-modal-btn.cancel:hover { border-color:var(--np-border-gold); color:var(--np-ivory-dim); }
        .fv-modal-btn.confirm {
          background:rgba(192,57,43,0.15); border:1px solid rgba(192,57,43,0.35); color:#f87171;
        }
        .fv-modal-btn.confirm:hover { background:rgba(192,57,43,0.25); border-color:rgba(248,113,113,0.5); }

        /* ── animations ── */
        @keyframes fv-fade-in  { from{opacity:0;}             to{opacity:1;} }
        @keyframes fv-scale-in { from{opacity:0;transform:scale(0.96);} to{opacity:1;transform:none;} }
        @keyframes fv-fade-up  { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:none;} }
        .fv-fade-up { animation:fv-fade-up 0.5s cubic-bezier(.16,1,.3,1) both; }
        .fv-fade-up-1 { animation-delay:0.05s; }
        .fv-fade-up-2 { animation-delay:0.12s; }
        .fv-fade-up-3 { animation-delay:0.18s; }

        .fv-scrollbar::-webkit-scrollbar { width:3px; }
        .fv-scrollbar::-webkit-scrollbar-track { background:transparent; }
        .fv-scrollbar::-webkit-scrollbar-thumb { background:var(--np-ash); border-radius:2px; }

        @keyframes np-spin { to{transform:rotate(360deg);} }
      `}</style>

      <div className="fv-root">
        <div className="fv-bg-grid" />
        <div className="fv-bg-orb-1" />
        <div className="fv-bg-orb-2" />

        <div style={{ position: "relative", zIndex: 1 }}>
          <NavBar />

          <main style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px" }}>

            {/* ── HEADER ── */}
            <div className="fv-card-gold fv-corners fv-fade-up" style={{ padding: "40px 44px", marginBottom: 20 }}>
              <div className="fcc-bl" /><div className="fcc-br" />
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
                <div>
                  <div className="fv-badge fv-badge-gold" style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 12 }}>✦</span>
                    Sevimlilar ro'yxati
                  </div>
                  <h1 className="fv-display" style={{ fontSize: "clamp(28px,4vw,48px)", color: "var(--np-ivory)", marginBottom: 10 }}>
                    Mening{" "}
                    <em style={{ fontStyle: "italic", fontWeight: 300, color: "var(--np-gold-lt)" }}>sevimlilarim</em>
                  </h1>
                  <p style={{ color: "var(--np-ivory-mute)", fontSize: 14, lineHeight: 1.7, maxWidth: 500 }}>
                    Saqlangan restoranlar va mahsulotlaringizni bir joyda kuzatib boring
                  </p>
                </div>

                {/* Search */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="fv-search-wrap">
                    <svg className="fv-search-icon" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      className="fv-search"
                      type="text"
                      placeholder="Qidirish..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {searchTerm && (
                    <button className="fv-clear" onClick={() => setSearchTerm("")}>
                      Tozalash
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── STAT CARDS ── */}
            <div className="fv-fade-up fv-fade-up-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Jami sevimlilar", value: favorites.length, icon: "✦", color: "var(--np-gold-lt)" },
                { label: "Restoranlar",     value: restaurantFavorites.length, icon: "🏪", color: "var(--np-em-bright)" },
                { label: "Mahsulotlar",     value: variantFavorites.length,    icon: "🍽️", color: "var(--np-ivory-dim)" },
              ].map((s) => (
                <div key={s.label} className="fv-stat">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--np-ivory-mute)" }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                  </div>
                  <div className="fv-display" style={{ fontSize: 42, color: s.color, lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* ── FAVORITES PANEL ── */}
            <div className="fv-card-gold fv-fade-up fv-fade-up-2" style={{ overflow: "hidden" }}>

              {/* Panel header: ornament + tabs + count */}
              <div style={{
                borderBottom: "1px solid var(--np-border-ash)",
                display: "flex", alignItems: "stretch", justifyContent: "space-between",
                flexWrap: "wrap", gap: 0,
              }}>
                {/* Tabs */}
                <div style={{ display: "flex", alignItems: "stretch" }}>
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`fv-tab ${activeTab === tab.id ? "active" : ""}`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                      <span style={{
                        fontFamily: "'DM Mono',monospace", fontSize: 9,
                        padding: "2px 7px", borderRadius: 1,
                        background: activeTab === tab.id ? "var(--np-gold-pale)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${activeTab === tab.id ? "rgba(201,168,76,0.25)" : "var(--np-border-ash)"}`,
                        color: activeTab === tab.id ? "var(--np-gold-lt)" : "var(--np-ivory-mute)",
                      }}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Right: ornament */}
                <div style={{ display: "flex", alignItems: "center", padding: "0 28px" }}>
                  <div className="fv-ornament">
                    <span>Ro'yxat</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              {displayedFavorites.length === 0 ? (
                <div className="fv-empty">
                  <div style={{
                    width: 56, height: 56, borderRadius: 2, margin: "0 auto 20px",
                    background: "rgba(255,255,255,0.03)", border: "1px solid var(--np-border-ash)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="24" height="24" fill="none" stroke="var(--np-ivory-mute)" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <p className="fv-display" style={{ fontSize: 22, color: "var(--np-ivory-dim)", marginBottom: 8 }}>
                    {searchTerm ? "Hech narsa topilmadi" : "Sevimlilar bo'sh"}
                  </p>
                  <p style={{ color: "var(--np-ivory-mute)", fontSize: 13, marginBottom: 28 }}>
                    {searchTerm
                      ? "Boshqa so'zlar bilan qidirib ko'ring"
                      : "Restoranlar va mahsulotlarni favoritlarga qo'shing"}
                  </p>
                  {!searchTerm && (
                    <Link href="/compare" style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "10px 24px", borderRadius: 1,
                      background: "linear-gradient(135deg,var(--np-emerald),#1b4332)",
                      border: "1px solid rgba(82,183,136,0.3)",
                      color: "var(--np-ivory)",
                      fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
                      textDecoration: "none",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                    }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Mahsulot qidirish
                    </Link>
                  )}
                </div>

              ) : (
                <div className="fv-scrollbar" style={{ maxHeight: 640, overflowY: "auto" }}>
                  {displayedFavorites.map((fav) => (
                    <div key={fav.id} className="fv-row">

                      {/* Icon */}
                      <div className="fv-icon-box">
                        {fav.type === "restaurant" ? "🏪" : "🍽️"}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>

                        {/* Name + type badge */}
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <h3 className="fv-display" style={{ fontSize: 20, color: "var(--np-ivory)" }}>
                            {fav.type === "restaurant" ? fav.name : fav.itemName}
                          </h3>
                          <span className={`fv-badge ${fav.type === "restaurant" ? "fv-badge-blue" : "fv-badge-em"}`}>
                            {fav.type === "restaurant" ? "Restoran" : "Mahsulot"}
                          </span>
                        </div>

                        {/* Restaurant-specific */}
                        {fav.type === "restaurant" && (
                          <>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--np-ivory-mute)", fontSize: 13, marginBottom: 10 }}>
                              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                              {fav.address}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                              {fav.phone && (
                                <a href={`tel:${fav.phone}`} className="fv-pill" style={{ textDecoration: "none", transition: "color 0.2s" }}>
                                  <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {fav.phone}
                                </a>
                              )}
                            </div>
                          </>
                        )}

                        {/* Variant-specific */}
                        {fav.type === "variant" && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                            {fav.category && (
                              <span className="fv-pill">{fav.category}</span>
                            )}
                            {fav.size && (
                              <span className="fv-pill">{fav.size}</span>
                            )}
                            {fav.label && (
                              <span className="fv-pill">{fav.label}</span>
                            )}
                          </div>
                        )}

                        {/* Added date */}
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10, color: "var(--np-ivory-mute)", fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                          <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(fav.addedAt).toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric" })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
                        {fav.type === "restaurant" && fav.lat && fav.lng && (
                          <a
                            href={getGoogleMapsUrl(fav.lat, fav.lng)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="fv-action map-btn"
                            title="Google Maps da ko'rish"
                          >
                            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                          </a>
                        )}

                        {fav.type === "variant" && (
                          <Link
                            href={`/compare?item=${fav.variantId}`}
                            className="fv-action link-btn"
                            title="Narxlarni solishtirish"
                          >
                            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </Link>
                        )}

                        <button
                          onClick={() => confirmRemove(fav)}
                          className="fv-action del-btn"
                          title="O'chirish"
                        >
                          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── TIP ── */}
            {favorites.length > 0 && (
              <div className="fv-tip fv-fade-up fv-fade-up-3">
                <div style={{ color: "var(--np-gold)", fontSize: 18, flexShrink: 0, marginTop: 2 }}>◈</div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14, color: "var(--np-ivory)", marginBottom: 6 }}>Maslahat</div>
                  <p style={{ fontSize: 13, color: "var(--np-ivory-mute)", lineHeight: 1.7 }}>
                    Sevimli restoranlaringizni Google Maps orqali toping yoki mahsulot narxlarini solishtirish uchun to'g'ridan-to'g'ri o'ting.
                  </p>
                </div>
                <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                  <Link href="/compare" style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "9px 20px", borderRadius: 1,
                    background: "rgba(255,255,255,0.03)", border: "1px solid var(--np-border-ash)",
                    color: "var(--np-ivory-mute)",
                    fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
                    textDecoration: "none", transition: "all 0.22s",
                  }}>
                    Davom etish
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ── CONFIRM MODAL ── */}
      {showConfirmModal && itemToRemove && (
        <div className="fv-modal-overlay">
          <div className="fv-modal fv-corners">
            <div className="fcc-bl" /><div className="fcc-br" />

            {/* Delete icon */}
            <div style={{
              width: 52, height: 52, borderRadius: 2, margin: "0 auto 24px",
              background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" fill="none" stroke="#f87171" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 className="fv-display" style={{ fontSize: 26, color: "var(--np-ivory)", textAlign: "center", marginBottom: 12 }}>
              O'chirishni tasdiqlang
            </h3>
            <p style={{ color: "var(--np-ivory-mute)", fontSize: 13, textAlign: "center", lineHeight: 1.7, marginBottom: 32 }}>
              {itemToRemove.type === "restaurant"
                ? `"${itemToRemove.name}" restoranini sevimlilardan o'chirmoqchimisiz?`
                : `"${itemToRemove.itemName}" mahsulotini sevimlilardan o'chirmoqchimisiz?`}
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="fv-modal-btn cancel" onClick={() => setShowConfirmModal(false)}>
                Bekor qilish
              </button>
              <button className="fv-modal-btn confirm" onClick={() => handleRemove(itemToRemove.id)}>
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}