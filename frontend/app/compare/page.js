// frontend/app/compare/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import {
  apiFetch,
  getCategories,
  searchVariants,
  comparePricesByVariant,
} from "@/lib/api";
import { getFavorites, toggleFavorite } from "@/lib/favorites";

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function dedupeSearchResultsByItem(items) {
  const list = normalizeList(items);
  const seen = new Set();
  return list.filter((item) => {
    const key = String(item.item_id || item.id || item.item_name || item.name || "").trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatMoney(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString("ru-RU");
}

function getRestaurantAddress(price) {
  return (
    price?.restaurant_address ||
    price?.address_text ||
    price?.restaurant_address_text ||
    price?.address ||
    price?.restaurant?.address_text ||
    price?.restaurant?.address ||
    "Manzil ko'rsatilmagan"
  );
}

function getDistanceText(price) {
  if (price?.distance_km === null || price?.distance_km === undefined) return "Masofa noma'lum";
  const distanceKm = Number(price.distance_km);
  if (Number.isNaN(distanceKm)) return "Masofa noma'lum";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(2)} km`;
}

/* ─── Spinner ─── */
function Spinner() {
  return (
    <svg style={{ width: 20, height: 20, animation: "cp-spin 0.8s linear infinite" }} fill="none" viewBox="0 0 24 24">
      <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ─── Step card (sidebar) ─── */
function StepCard({ number, title, text, icon }) {
  return (
    <div style={{
      display: "flex", gap: 14, padding: "16px 0",
      borderBottom: "1px solid var(--cp-border-ash)",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 1, flexShrink: 0,
        background: "linear-gradient(135deg, var(--cp-emerald) 0%, #1b4332 100%)",
        border: "1px solid rgba(82,183,136,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 400,
        color: "var(--cp-ivory)", letterSpacing: "0.1em",
      }}>
        {number}
      </div>
      <div>
        <div style={{ fontWeight: 500, fontSize: 14, color: "var(--cp-ivory)", marginBottom: 4 }}>
          {icon} {title}
        </div>
        <div style={{ fontSize: 13, color: "var(--cp-ivory-mute)", lineHeight: 1.6 }}>{text}</div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [variants, setVariants] = useState([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [prices, setPrices] = useState([]);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => { setFavorites(getFavorites()); }, []);
  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    try { setCategories(normalizeList(await getCategories())); }
    catch { setCategories([]); }
  }

  async function handleSearch() {
    const q = searchQuery.trim();
    if (!q) { setSearchResults([]); return; }
    setSearchLoading(true);
    setSelectedItem(null); setSelectedVariant(null); setVariants([]); setPrices([]);
    try {
      let data;
      if (selectedCategory) {
        data = await apiFetch(`/api/menu/search/variants/?q=${encodeURIComponent(q)}&category=${encodeURIComponent(selectedCategory)}`, { method: "GET", auth: false });
      } else {
        data = await searchVariants(q);
      }
      setSearchResults(dedupeSearchResultsByItem(data));
    } catch { setSearchResults([]); }
    finally { setSearchLoading(false); }
  }

  async function handleSelectItem(item) {
    setSelectedItem(item); setSelectedVariant(null); setPrices([]); setVariants([]);
    setVariantsLoading(true);
    try {
      const rawItemId = item.item_id || item.id;
      const itemId = String(rawItemId).trim();
      if (!itemId || itemId === "undefined" || itemId === "null") { setVariants([]); return; }
      setVariants(normalizeList(await apiFetch(`/api/menu/items/${encodeURIComponent(itemId)}/variants/`, { method: "GET", auth: false })));
    } catch { setVariants([]); }
    finally { setVariantsLoading(false); }
  }

  async function handleSelectVariant(variant) {
    setSelectedVariant(variant); setPrices([]); setPricesLoading(true);
    try { setPrices(normalizeList(await comparePricesByVariant(variant.id))); }
    catch { setPrices([]); }
    finally { setPricesLoading(false); }
  }

  function handleToggleFavoriteVariant(variant) {
    setFavorites(toggleFavorite({
      id: `variant_${variant.id}`, type: "variant", variantId: variant.id,
      itemName: variant.item_name, category: variant.category_name,
      size: `${variant.size_value} ${variant.size_unit}`, label: variant.label,
      addedAt: new Date().toISOString(),
    }));
  }

  function handleToggleFavoritePrice(price) {
    setFavorites(toggleFavorite({
      id: `price_${price.id}`, type: "price", priceId: price.id,
      restaurant: price.restaurant_name, address: getRestaurantAddress(price),
      price: price.price_amount, variant: selectedVariant?.label,
      item: selectedItem?.item_name || selectedItem?.name,
      size: selectedVariant ? `${selectedVariant.size_value} ${selectedVariant.size_unit}` : "",
      addedAt: new Date().toISOString(),
    }));
  }

  function isVariantFavorite(variantId) { return favorites.some((f) => f.type === "variant" && String(f.variantId) === String(variantId)); }
  function isPriceFavorite(priceId) { return favorites.some((f) => (f.type === "price" && String(f.priceId) === String(priceId)) || f.id === `price_${priceId}`); }
  function handleKeyDown(e) { if (e.key === "Enter") handleSearch(); }
  function resetSelection() { setSelectedItem(null); setSelectedVariant(null); setVariants([]); setPrices([]); }

  const selectedItemTitle = useMemo(() => {
    if (!selectedItem) return "";
    return selectedItem.item_name || selectedItem.name || "Tanlangan mahsulot";
  }, [selectedItem]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,600&family=DM+Mono:wght@300;400&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --cp-coal:       #0e0e0e;
          --cp-charcoal:   #161616;
          --cp-graphite:   #1e1e1e;
          --cp-ash:        #2a2a2a;
          --cp-ivory:      #f5f0e8;
          --cp-ivory-dim:  #c8bfa8;
          --cp-ivory-mute: #7a7168;
          --cp-gold:       #c9a84c;
          --cp-gold-lt:    #e6c97a;
          --cp-gold-dk:    #8a6a25;
          --cp-gold-pale:  rgba(201,168,76,0.07);
          --cp-emerald:    #2d6a4f;
          --cp-em-lt:      #52b788;
          --cp-em-bright:  #74c69d;
          --cp-border-gold: rgba(201,168,76,0.18);
          --cp-border-ash:  rgba(255,255,255,0.07);
        }

        .cp-root {
          min-height: 100vh;
          background: var(--cp-coal);
          color: var(--cp-ivory);
          font-family: 'Jost', system-ui, sans-serif;
          font-weight: 300;
          position: relative;
          overflow-x: hidden;
        }

        /* bg */
        .cp-bg-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(201,168,76,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.022) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .cp-bg-orb-1 { position:fixed; top:-20%; right:-15%; width:55vw; height:55vw; border-radius:50%; background:radial-gradient(circle,rgba(45,106,79,0.07) 0%,transparent 65%); pointer-events:none; z-index:0; }
        .cp-bg-orb-2 { position:fixed; bottom:5%; left:-20%; width:42vw; height:42vw; border-radius:50%; background:radial-gradient(circle,rgba(201,168,76,0.05) 0%,transparent 65%); pointer-events:none; z-index:0; }

        /* display font */
        .cp-display { font-family:'Cormorant Garamond',Georgia,serif; font-weight:600; letter-spacing:-0.01em; }
        .cp-mono { font-family:'DM Mono',monospace; font-weight:300; font-size:10px; letter-spacing:0.15em; text-transform:uppercase; }

        /* card */
        .cp-card {
          background: var(--cp-charcoal);
          border: 1px solid var(--cp-border-ash);
          border-radius: 2px;
          position: relative;
          overflow: hidden;
        }
        .cp-card-gold {
          background: var(--cp-charcoal);
          border: 1px solid var(--cp-border-gold);
          border-radius: 2px;
          position: relative;
          overflow: hidden;
        }
        .cp-card-gold::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,var(--cp-gold) 30%,var(--cp-em-bright) 70%,transparent);
        }

        /* inputs */
        .cp-input, .cp-select {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--cp-border-ash);
          border-radius: 1px;
          padding: 12px 16px;
          color: var(--cp-ivory);
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          font-weight: 300;
          outline: none;
          transition: border-color 0.25s, background 0.25s;
          -webkit-appearance: none;
          width: 100%;
        }
        .cp-input::placeholder { color: var(--cp-ivory-mute); }
        .cp-input:focus, .cp-select:focus { border-color: rgba(201,168,76,0.45); background: rgba(201,168,76,0.025); }
        .cp-select option { background: var(--cp-graphite); color: var(--cp-ivory); }

        /* search input with icon */
        .cp-search-wrap { position: relative; flex: 1; }
        .cp-search-wrap .cp-input { padding-left: 42px; }
        .cp-search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--cp-ivory-mute); pointer-events:none; }

        /* buttons */
        .cp-btn-primary {
          display:inline-flex; align-items:center; gap:8px;
          padding:12px 28px;
          background:linear-gradient(135deg,var(--cp-emerald) 0%,#1b4332 100%);
          border:none; border-radius:1px;
          color:var(--cp-ivory);
          font-family:'DM Mono',monospace; font-size:11px; letter-spacing:0.18em; text-transform:uppercase;
          cursor:pointer; white-space:nowrap;
          box-shadow:0 0 0 1px rgba(82,183,136,0.25), 0 6px 24px rgba(0,0,0,0.4);
          transition:transform 0.25s, box-shadow 0.25s, opacity 0.2s;
          text-decoration:none;
        }
        .cp-btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 0 0 1px var(--cp-em-lt),0 12px 40px rgba(0,0,0,0.5); }
        .cp-btn-primary:disabled { opacity:0.5; cursor:not-allowed; }

        .cp-btn-ghost {
          display:inline-flex; align-items:center; gap:8px;
          padding:11px 22px;
          border:1px solid var(--cp-border-gold); border-radius:1px;
          color:var(--cp-ivory-dim); background:transparent;
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.14em; text-transform:uppercase;
          cursor:pointer; text-decoration:none;
          transition:all 0.25s;
        }
        .cp-btn-ghost:hover { border-color:var(--cp-gold); color:var(--cp-gold-lt); background:var(--cp-gold-pale); transform:translateY(-2px); }

        /* search result row */
        .cp-result-row {
          display:flex; align-items:center; gap:14px;
          padding:16px 20px;
          border-bottom:1px solid var(--cp-border-ash);
          cursor:pointer;
          transition:background 0.2s;
        }
        .cp-result-row:last-child { border-bottom:none; }
        .cp-result-row:hover { background:rgba(201,168,76,0.04); }

        /* variant btn */
        .cp-variant-btn {
          background:rgba(255,255,255,0.03);
          border:1px solid var(--cp-border-ash);
          border-radius:1px; padding:20px;
          text-align:center; cursor:pointer; width:100%;
          transition:border-color 0.25s, background 0.25s, transform 0.25s;
          color:var(--cp-ivory);
        }
        .cp-variant-btn:hover { border-color:var(--cp-border-gold); background:var(--cp-gold-pale); }
        .cp-variant-btn.active {
          border-color:var(--cp-em-lt);
          background:rgba(82,183,136,0.06);
          box-shadow:0 0 0 1px rgba(82,183,136,0.2);
        }

        /* price row */
        .cp-price-row {
          border:1px solid var(--cp-border-ash);
          border-radius:2px;
          padding:22px 24px;
          display:flex; align-items:flex-start; justify-content:space-between; gap:16px;
          background:var(--cp-graphite);
          transition:border-color 0.25s, transform 0.3s cubic-bezier(.16,1,.3,1);
          margin-bottom:10px;
          position:relative; overflow:hidden;
        }
        .cp-price-row:hover { transform:translateY(-3px); border-color:var(--cp-border-gold); }
        .cp-price-row.best {
          border-color:rgba(201,168,76,0.35);
          background:rgba(201,168,76,0.04);
        }
        .cp-price-row.best::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,var(--cp-gold),transparent);
        }

        /* star btn */
        .cp-star {
          background:none; border:none; cursor:pointer; padding:6px;
          border-radius:50%; transition:color 0.2s, transform 0.2s; flex-shrink:0;
        }
        .cp-star:hover { transform:scale(1.2); }

        /* badge */
        .cp-badge {
          display:inline-flex; align-items:center; gap:5px;
          border-radius:1px; padding:4px 10px;
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase;
        }
        .cp-badge-gold { background:var(--cp-gold-pale); border:1px solid rgba(201,168,76,0.25); color:var(--cp-gold-lt); }
        .cp-badge-em { background:rgba(82,183,136,0.1); border:1px solid rgba(82,183,136,0.25); color:var(--cp-em-bright); }
        .cp-badge-gray { background:rgba(255,255,255,0.04); border:1px solid var(--cp-border-ash); color:var(--cp-ivory-mute); }

        /* ornament */
        .cp-ornament { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
        .cp-ornament::before,.cp-ornament::after { content:''; display:block; height:1px; width:28px; }
        .cp-ornament::before { background:linear-gradient(90deg,transparent,var(--cp-gold)); }
        .cp-ornament::after { background:linear-gradient(90deg,var(--cp-gold),transparent); }
        .cp-ornament span { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:var(--cp-gold); opacity:0.7; }

        /* sidebar stat */
        .cp-stat-row { display:flex; justify-content:space-between; align-items:baseline; padding:10px 0; border-bottom:1px solid var(--cp-border-ash); }
        .cp-stat-row:last-child { border-bottom:none; }

        /* empty state */
        .cp-empty {
          border:1px dashed rgba(255,255,255,0.1);
          border-radius:2px; padding:40px 24px; text-align:center;
        }

        /* animations */
        @keyframes cp-spin { to { transform:rotate(360deg); } }
        @keyframes cp-fade-up { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;} }
        .cp-fade-up { animation:cp-fade-up 0.5s cubic-bezier(.16,1,.3,1) both; }

        /* scrollbar */
        .cp-scroll::-webkit-scrollbar { width:4px; }
        .cp-scroll::-webkit-scrollbar-track { background:transparent; }
        .cp-scroll::-webkit-scrollbar-thumb { background:var(--cp-ash); border-radius:2px; }
        .cp-scroll::-webkit-scrollbar-thumb:hover { background:var(--cp-gold-dk); }

        /* deco corners */
        .cp-corners::before, .cp-corners::after,
        .cp-corners > .cc-bl, .cp-corners > .cc-br {
          content:''; position:absolute; width:16px; height:16px;
        }
        .cp-corners::before { top:10px; left:10px; border-top:1px solid var(--cp-border-gold); border-left:1px solid var(--cp-border-gold); }
        .cp-corners::after  { top:10px; right:10px; border-top:1px solid var(--cp-border-gold); border-right:1px solid var(--cp-border-gold); }
        .cp-corners > .cc-bl { bottom:10px; left:10px; border-bottom:1px solid var(--cp-border-gold); border-left:1px solid var(--cp-border-gold); }
        .cp-corners > .cc-br { bottom:10px; right:10px; border-bottom:1px solid var(--cp-border-gold); border-right:1px solid var(--cp-border-gold); }
      `}</style>

      <div className="cp-root">
        <div className="cp-bg-grid" />
        <div className="cp-bg-orb-1" />
        <div className="cp-bg-orb-2" />

        <div style={{ position: "relative", zIndex: 1 }}>
          <NavBar />

          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>

            {/* ── HEADER ── */}
            <div className="cp-card-gold cp-corners cp-fade-up" style={{ padding: "40px 44px", marginBottom: 28 }}>
              <div className="cc-bl" /><div className="cc-br" />
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
                <div>
                  <div className="cp-badge cp-badge-em" style={{ marginBottom: 16 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cp-em-bright)", display: "inline-block" }} />
                    Narxlarni solishtirish
                  </div>
                  <h1 className="cp-display" style={{ fontSize: "clamp(28px, 4vw, 48px)", color: "var(--cp-ivory)", marginBottom: 10 }}>
                    Eng arzon narxni{" "}
                    <em style={{ fontStyle: "italic", fontWeight: 300, background: "linear-gradient(90deg,var(--cp-gold-dk),var(--cp-gold-lt),var(--cp-gold))", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      toping
                    </em>
                  </h1>
                  <p style={{ color: "var(--cp-ivory-mute)", fontSize: 14, maxWidth: 520, lineHeight: 1.7 }}>
                    Mahsulotni qidiring, kategoriya tanlang, variantni belgilang va
                    restoranlar bo'yicha eng yaxshi narxni bir zumda toping.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href="/nearby" className="cp-btn-ghost">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Yaqin joylar
                  </Link>
                  <Link href="/login" className="cp-btn-primary">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Kirish
                  </Link>
                </div>
              </div>
            </div>

            {/* ── MAIN GRID ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

              {/* ─── LEFT COLUMN ─── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>

                {/* SEARCH CARD */}
                <div className="cp-card" style={{ padding: "36px 40px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28 }}>
                    <div>
                      <div className="cp-ornament"><span>Qidiruv</span></div>
                      <h2 className="cp-display" style={{ fontSize: 28, color: "var(--cp-ivory)" }}>
                        Mahsulot qidirish
                      </h2>
                      <p style={{ color: "var(--cp-ivory-mute)", fontSize: 13, marginTop: 6 }}>
                        Kategoriya tanlash qidiruvni tezlashtiradi va natijani aniqroq qiladi
                      </p>
                    </div>
                    <div className="cp-badge cp-badge-gold">
                      ⭐ Favoritlar: {favorites.length}
                    </div>
                  </div>

                  {/* Search controls */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="cp-select"
                      style={{ width: 220, flexShrink: 0 }}
                    >
                      <option value="">Barcha kategoriyalar</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug || cat.id}>{cat.name}</option>
                      ))}
                    </select>

                    <div className="cp-search-wrap" style={{ flex: 1, minWidth: 180 }}>
                      <svg className="cp-search-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Masalan: cappuccino, lavash, burger..."
                        className="cp-input"
                      />
                    </div>

                    <button type="button" onClick={handleSearch} disabled={searchLoading} className="cp-btn-primary">
                      {searchLoading ? <><Spinner /> Qidirilmoqda...</> : "Qidirish"}
                    </button>
                  </div>

                  {/* ── SEARCH RESULTS ── */}
                  {!selectedItem ? (
                    <div style={{ marginTop: 24 }}>
                      {searchResults.length > 0 ? (
                        <div className="cp-card cp-scroll" style={{ maxHeight: 480, overflowY: "auto" }}>
                          {searchResults.map((result) => (
                            <div
                              key={`${result.id}_${result.item_id}`}
                              className="cp-result-row"
                              onClick={() => handleSelectItem(result)}
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 500, fontSize: 15, color: "var(--cp-ivory)", marginBottom: 4, fontFamily: "'Cormorant Garamond',serif" }}>
                                  {result.item_name}
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                                  <span className="cp-badge cp-badge-gray">{result.category_name}</span>
                                  <span style={{ color: "var(--cp-ivory-mute)", fontSize: 12 }}>{result.size_value} {result.size_unit}</span>
                                  <span style={{ color: "var(--cp-border-ash)", fontSize: 10 }}>◆</span>
                                  <span style={{ color: "var(--cp-ivory-mute)", fontSize: 12 }}>{result.label}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="cp-star"
                                style={{ color: isVariantFavorite(result.id) ? "var(--cp-gold)" : "var(--cp-ash)" }}
                                onClick={(e) => { e.stopPropagation(); handleToggleFavoriteVariant(result); }}
                                title={isVariantFavorite(result.id) ? "Favoritdan olib tashlash" : "Favoritga qo'shish"}
                              >
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : searchQuery.trim() && !searchLoading ? (
                        <div className="cp-empty">
                          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}>◈</div>
                          <div style={{ color: "var(--cp-ivory-dim)", fontWeight: 500 }}>Hech narsa topilmadi</div>
                          <div style={{ color: "var(--cp-ivory-mute)", fontSize: 13, marginTop: 4 }}>Boshqa so'zlar bilan qidirib ko'ring</div>
                        </div>
                      ) : (
                        <div className="cp-empty">
                          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>⬦</div>
                          <div style={{ color: "var(--cp-ivory-dim)", fontWeight: 500 }}>Kategoriya tanlang va mahsulot nomini yozing</div>
                          <div style={{ color: "var(--cp-ivory-mute)", fontSize: 13, marginTop: 4 }}>Masalan: "cappuccino", "lavash", "burger"</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: 24 }}>
                      {/* Selected item banner */}
                      <div style={{
                        display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16,
                        border: "1px solid rgba(82,183,136,0.25)",
                        background: "rgba(82,183,136,0.05)",
                        borderRadius: 2, padding: "20px 24px", marginBottom: 24,
                        position: "relative", overflow: "hidden",
                      }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,var(--cp-em-lt),transparent)" }} />
                        <div>
                          <div className="cp-mono" style={{ color: "var(--cp-em-bright)", marginBottom: 6 }}>✦ Tanlangan mahsulot</div>
                          <div className="cp-display" style={{ fontSize: 24, color: "var(--cp-ivory)" }}>{selectedItemTitle}</div>
                          <div style={{ fontSize: 12, color: "var(--cp-ivory-mute)", marginTop: 4 }}>{selectedItem.category_name || "Kategoriya yo'q"}</div>
                        </div>
                        <button type="button" onClick={resetSelection} className="cp-btn-ghost">
                          ↺ Boshqa mahsulot
                        </button>
                      </div>

                      {/* Variants */}
                      <div className="cp-ornament"><span>Variantni tanlang</span></div>

                      {variantsLoading ? (
                        <div className="cp-empty">
                          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><Spinner /></div>
                          <div style={{ color: "var(--cp-ivory-mute)", fontSize: 13 }}>Variantlar yuklanmoqda...</div>
                        </div>
                      ) : variants.length > 0 ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
                          {variants.map((variant) => {
                            const active = String(selectedVariant?.id) === String(variant.id);
                            return (
                              <button
                                key={variant.id}
                                type="button"
                                onClick={() => handleSelectVariant(variant)}
                                className={`cp-variant-btn ${active ? "active" : ""}`}
                              >
                                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 600, color: active ? "var(--cp-em-bright)" : "var(--cp-ivory)", marginBottom: 4 }}>
                                  {variant.label}
                                </div>
                                <div className="cp-mono" style={{ color: "var(--cp-ivory-mute)", fontSize: 10 }}>
                                  {variant.size_value} {variant.size_unit}
                                </div>
                                {active && (
                                  <div className="cp-mono" style={{ color: "var(--cp-em-lt)", marginTop: 8, fontSize: 9 }}>✦ Tanlangan</div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="cp-empty">
                          <div style={{ color: "var(--cp-gold)", fontSize: 13, marginBottom: 6 }}>◈</div>
                          <div style={{ color: "var(--cp-ivory-dim)", fontWeight: 500 }}>Bu mahsulot uchun variant topilmadi</div>
                          <div style={{ color: "var(--cp-ivory-mute)", fontSize: 12, marginTop: 4 }}>Boshqa mahsulot tanlang yoki keyinroq qaytib ko'ring</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* PRICES CARD */}
                {selectedVariant && (
                  <div className="cp-card-gold cp-corners cp-fade-up" style={{ padding: "36px 40px" }}>
                    <div className="cc-bl" /><div className="cc-br" />
                    <div style={{ marginBottom: 28 }}>
                      <div className="cp-ornament"><span>Narx natijalari</span></div>
                      <h2 className="cp-display" style={{ fontSize: 28, color: "var(--cp-ivory)", marginBottom: 8 }}>
                        Narx natijalari
                      </h2>
                      <p style={{ color: "var(--cp-ivory-mute)", fontSize: 13 }}>
                        {selectedItemTitle} — {selectedVariant.label} ({selectedVariant.size_value} {selectedVariant.size_unit})
                      </p>
                    </div>

                    {pricesLoading ? (
                      <div className="cp-empty">
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><Spinner /></div>
                        <div style={{ color: "var(--cp-ivory-mute)", fontSize: 13 }}>Narxlar yuklanmoqda...</div>
                      </div>
                    ) : prices.length === 0 ? (
                      <div className="cp-empty">
                        <div style={{ fontSize: 32, opacity: 0.3, marginBottom: 12 }}>◈</div>
                        <div style={{ color: "var(--cp-ivory-dim)", fontWeight: 500, marginBottom: 6 }}>Bu variant uchun narx topilmadi</div>
                        <div style={{ color: "var(--cp-ivory-mute)", fontSize: 13 }}>
                          Birinchi bo'lib narx qo'shish uchun owner paneldan foydalaning
                        </div>
                      </div>
                    ) : (
                      <div>
                        {prices.map((price, index) => (
                          <div
                            key={price.id || index}
                            className={`cp-price-row ${index === 0 ? "best" : ""}`}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {/* Rank + price */}
                              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 10 }}>
                                {index === 0 && (
                                  <span className="cp-badge cp-badge-gold">✦ Eng arzon</span>
                                )}
                                <span className="cp-badge cp-badge-gray">#{index + 1}</span>
                                <span className="cp-display" style={{
                                  fontSize: 26,
                                  color: index === 0 ? "var(--cp-gold-lt)" : "var(--cp-ivory)",
                                }}>
                                  {formatMoney(price.price_amount)}{" "}
                                  <span style={{ fontSize: 14, fontFamily: "'DM Mono',monospace", letterSpacing: "0.1em", opacity: 0.6 }}>so'm</span>
                                </span>
                              </div>

                              {/* Restaurant name */}
                              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 600, color: "var(--cp-ivory)", marginBottom: 6 }}>
                                {price.restaurant_name || "Noma'lum restoran"}
                              </div>

                              {/* Address */}
                              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--cp-ivory-mute)", fontSize: 13, marginBottom: 12 }}>
                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {getRestaurantAddress(price)}
                              </div>

                              {/* Tags */}
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                <span className="cp-badge cp-badge-gray">
                                  <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                  {getDistanceText(price)}
                                </span>
                                {price.source_type && (
                                  <span className="cp-badge cp-badge-gray">{price.source_type}</span>
                                )}
                                {price.is_verified && (
                                  <span className="cp-badge cp-badge-em">✓ Verified</span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              className="cp-star"
                              style={{ color: isPriceFavorite(price.id) ? "var(--cp-gold)" : "var(--cp-ash)" }}
                              onClick={() => handleToggleFavoritePrice(price)}
                              title={isPriceFavorite(price.id) ? "Favoritdan olib tashlash" : "Favoritga qo'shish"}
                            >
                              <svg width="22" height="22" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ─── SIDEBAR ─── */}
              <aside style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 16 }}>

                {/* How it works */}
                <div className="cp-card" style={{ padding: "28px 28px 20px" }}>
                  <div className="cp-ornament"><span>Qanday ishlaydi</span></div>
                  <h2 className="cp-display" style={{ fontSize: 22, color: "var(--cp-ivory)", marginBottom: 6 }}>
                    Qanday ishlaydi?
                  </h2>
                  <div style={{ borderTop: "1px solid var(--cp-border-ash)", marginTop: 16 }}>
                    <StepCard number="1" icon="📁" title="Kategoriya tanlang" text="Masalan: coffee, fast food, desserts. Qidiruvni tezlashtiradi" />
                    <StepCard number="2" icon="🔍" title="Mahsulotni qidiring" text="Cappuccino, lavash, burger - xohlagan mahsulotni yozing" />
                    <StepCard number="3" icon="🎯" title="Variantni tanlang" text="250 ml, 400 g, medium, large - o'zingizga mosini belgilang" />
                    <StepCard number="4" icon="💰" title="Narxlarni solishtiring" text="Eng arzon, eng yaqin yoki eng qulay variantni toping" />
                  </div>
                </div>

                {/* Status */}
                <div className="cp-card-gold" style={{ padding: "24px 28px" }}>
                  <div className="cp-ornament" style={{ marginBottom: 16 }}><span>Hozirgi holat</span></div>
                  <div className="cp-stat-row">
                    <span style={{ fontSize: 13, color: "var(--cp-ivory-mute)" }}>Topilgan narxlar</span>
                    <span className="cp-display" style={{ fontSize: 22, color: "var(--cp-gold-lt)" }}>{prices.length}</span>
                  </div>
                  <div className="cp-stat-row">
                    <span style={{ fontSize: 13, color: "var(--cp-ivory-mute)" }}>Mavjud variantlar</span>
                    <span className="cp-display" style={{ fontSize: 22, color: "var(--cp-gold-lt)" }}>{variants.length}</span>
                  </div>
                  <div className="cp-stat-row">
                    <span style={{ fontSize: 13, color: "var(--cp-ivory-mute)" }}>Favoritlar</span>
                    <span className="cp-display" style={{ fontSize: 22, color: "var(--cp-gold)" }}>{favorites.length}</span>
                  </div>
                  <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--cp-border-ash)" }}>
                    <div className="cp-mono" style={{ color: "var(--cp-ivory-mute)", fontSize: 10 }}>
                      {selectedVariant ? "✦ Narxlar yuklandi" : selectedItem ? "→ Variantni tanlang" : "◈ Mahsulot qidiring"}
                    </div>
                  </div>
                </div>

                {/* Tip */}
                <div className="cp-card" style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ color: "var(--cp-gold)", fontSize: 18, flexShrink: 0, marginTop: 2 }}>◈</div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14, color: "var(--cp-ivory)", marginBottom: 6 }}>Maslahat</div>
                      <p style={{ fontSize: 12, color: "var(--cp-ivory-mute)", lineHeight: 1.7 }}>
                        Eng yaxshi natija uchun aniq mahsulot nomi va kategoriyani birga ishlating.
                        Favoritlarga qo'shilgan narxlar keyingi safar tezroq topiladi.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}