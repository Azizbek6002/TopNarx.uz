// frontend/app/nearby/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { nearbyRestaurants, nearbyCompare } from "@/lib/api";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import NavBar from "@/components/NavBar";

export default function NearbyPage() {
  const [location, setLocation] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(3);

  const [favorites, setFavorites] = useState([]);
  const [selectedItem, setSelectedItem] = useState("cappuccino");
  const [selectedSize, setSelectedSize] = useState(250);
  const [selectedUnit, setSelectedUnit] = useState("ml");

  const loading = loadingLocation || loadingRestaurants;

  useEffect(() => {
    setFavorites(getFavorites());
    getCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrentLocation = () => {
    setLoadingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Brauzeringiz lokatsiyani qo'llab-quvvatlamaydi");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        setLocation(newLocation);
        await fetchNearbyRestaurants(newLocation);
        setLoadingLocation(false);
      },
      (geoError) => {
        setError("Lokatsiyani aniqlashda xatolik: " + geoError.message);
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const fetchNearbyRestaurants = async (loc) => {
    setLoadingRestaurants(true);
    setError(null);
    try {
      const data = await nearbyRestaurants({ lat: loc.lat, lng: loc.lng, radius_km: searchRadius });
      const list = Array.isArray(data) ? data : data?.results || [];
      setRestaurants(list);
      if (!list.length) setError(`Yaqin atrofda restoran topilmadi (radius: ${searchRadius}km)`);
    } catch (err) {
      setError(err?.message || "Restaurantlarni yuklab bo'lmadi");
      setRestaurants([]);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    if (location) fetchNearbyRestaurants(location);
  };

  const handleCompare = async (restaurant) => {
    if (!location) return [];
    try {
      const data = await nearbyCompare({ item: selectedItem, size: selectedSize, unit: selectedUnit, lat: location.lat, lng: location.lng, radius_km: searchRadius });
      const list = Array.isArray(data) ? data : data?.results || [];
      return list.filter((p) => p.restaurant_id === restaurant.id);
    } catch { return []; }
  };

  const isRestaurantFavorite = (id) => favorites.some((f) => f.restaurantId === id && f.type === "restaurant");

  const handleToggleFavoriteRestaurant = (restaurant) => {
    setFavorites(toggleFavorite({
      id: `restaurant_${restaurant.id}`, type: "restaurant",
      restaurantId: restaurant.id, name: restaurant.name,
      address: restaurant.address_text, lat: restaurant.lat,
      lng: restaurant.lng, phone: restaurant.phone,
      addedAt: new Date().toISOString(),
    }));
  };

  const getGoogleMapsUrl = (lat, lng) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  const renderDistance = (restaurant) => {
    const d = restaurant?.distance_km;
    if (d === null || d === undefined) return null;
    const meters = (Number(d) * 1000).toFixed(0);
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.1em", color: "var(--np-em-lt)", background: "rgba(82,183,136,0.08)", border: "1px solid rgba(82,183,136,0.2)", borderRadius: 1, padding: "3px 10px" }}>
        <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {meters} m
      </span>
    );
  };

  /* ── Loading fullscreen ── */
  if (loading && !location) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,300&family=DM+Mono:wght@300;400&family=Jost:wght@300;400;500&display=swap');
          :root {
            --np-coal:#0e0e0e; --np-charcoal:#161616; --np-graphite:#1e1e1e;
            --np-ivory:#f5f0e8; --np-ivory-dim:#c8bfa8; --np-ivory-mute:#7a7168;
            --np-gold:#c9a84c; --np-gold-lt:#e6c97a; --np-gold-pale:rgba(201,168,76,0.07);
            --np-emerald:#2d6a4f; --np-em-lt:#52b788; --np-em-bright:#74c69d;
            --np-border-gold:rgba(201,168,76,0.18); --np-border-ash:rgba(255,255,255,0.07);
          }
          @keyframes np-spin { to{transform:rotate(360deg);} }
        `}</style>
        <div style={{ minHeight: "100vh", background: "var(--np-coal)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Jost',sans-serif" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 48, height: 48, border: "2px solid var(--np-border-ash)", borderTopColor: "var(--np-gold)", borderRadius: "50%", animation: "np-spin 1s linear infinite", margin: "0 auto 24px" }} />
            <p style={{ color: "var(--np-ivory-dim)", fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>Lokatsiya aniqlanmoqda</p>
            <p style={{ color: "var(--np-ivory-mute)", fontSize: 13, marginTop: 6 }}>Iltimos, joylashuv ruxsatini bering</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,600&family=DM+Mono:wght@300;400&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --np-coal:       #0e0e0e;
          --np-charcoal:   #161616;
          --np-graphite:   #1e1e1e;
          --np-ash:        #2a2a2a;
          --np-ivory:      #f5f0e8;
          --np-ivory-dim:  #c8bfa8;
          --np-ivory-mute: #7a7168;
          --np-gold:       #c9a84c;
          --np-gold-lt:    #e6c97a;
          --np-gold-dk:    #8a6a25;
          --np-gold-pale:  rgba(201,168,76,0.07);
          --np-emerald:    #2d6a4f;
          --np-em-lt:      #52b788;
          --np-em-bright:  #74c69d;
          --np-border-gold: rgba(201,168,76,0.18);
          --np-border-ash:  rgba(255,255,255,0.07);
        }

        .np-root {
          min-height: 100vh;
          background: var(--np-coal);
          color: var(--np-ivory);
          font-family: 'Jost', system-ui, sans-serif;
          font-weight: 300;
          position: relative;
          overflow-x: hidden;
        }

        /* bg */
        .np-bg-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(201,168,76,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.022) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .np-bg-orb-1 { position:fixed; top:-20%; right:-15%; width:55vw; height:55vw; border-radius:50%; background:radial-gradient(circle,rgba(45,106,79,0.07) 0%,transparent 65%); pointer-events:none; z-index:0; }
        .np-bg-orb-2 { position:fixed; bottom:5%; left:-20%; width:42vw; height:42vw; border-radius:50%; background:radial-gradient(circle,rgba(201,168,76,0.05) 0%,transparent 65%); pointer-events:none; z-index:0; }

        .np-display { font-family:'Cormorant Garamond',Georgia,serif; font-weight:600; letter-spacing:-0.01em; }
        .np-mono { font-family:'DM Mono',monospace; font-weight:300; letter-spacing:0.14em; text-transform:uppercase; }

        /* cards */
        .np-card {
          background: var(--np-charcoal);
          border: 1px solid var(--np-border-ash);
          border-radius: 2px;
          position: relative; overflow: hidden;
        }
        .np-card-gold {
          background: var(--np-charcoal);
          border: 1px solid var(--np-border-gold);
          border-radius: 2px;
          position: relative; overflow: hidden;
        }
        .np-card-gold::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,var(--np-gold) 30%,var(--np-em-bright) 70%,transparent);
        }

        /* art deco corners */
        .np-corners::before, .np-corners::after,
        .np-corners > .ncc-bl, .np-corners > .ncc-br {
          content:''; position:absolute; width:16px; height:16px; pointer-events:none;
        }
        .np-corners::before { top:10px; left:10px; border-top:1px solid var(--np-border-gold); border-left:1px solid var(--np-border-gold); }
        .np-corners::after  { top:10px; right:10px; border-top:1px solid var(--np-border-gold); border-right:1px solid var(--np-border-gold); }
        .np-corners > .ncc-bl { bottom:10px; left:10px; border-bottom:1px solid var(--np-border-gold); border-left:1px solid var(--np-border-gold); }
        .np-corners > .ncc-br { bottom:10px; right:10px; border-bottom:1px solid var(--np-border-gold); border-right:1px solid var(--np-border-gold); }

        /* ornament divider */
        .np-ornament { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
        .np-ornament::before,.np-ornament::after { content:''; display:block; height:1px; width:28px; }
        .np-ornament::before { background:linear-gradient(90deg,transparent,var(--np-gold)); }
        .np-ornament::after  { background:linear-gradient(90deg,var(--np-gold),transparent); }
        .np-ornament span { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:var(--np-gold); opacity:0.7; }

        /* badge */
        .np-badge {
          display:inline-flex; align-items:center; gap:5px;
          border-radius:1px; padding:4px 11px;
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase;
        }
        .np-badge-em  { background:rgba(82,183,136,0.1); border:1px solid rgba(82,183,136,0.25); color:var(--np-em-bright); }
        .np-badge-gold { background:var(--np-gold-pale); border:1px solid rgba(201,168,76,0.25); color:var(--np-gold-lt); }
        .np-badge-gray { background:rgba(255,255,255,0.04); border:1px solid var(--np-border-ash); color:var(--np-ivory-mute); }

        /* radius buttons */
        .np-radius-btn {
          padding: 9px 20px;
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.14em; text-transform:uppercase;
          border-radius:1px; cursor:pointer;
          transition: all 0.22s;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--np-border-ash);
          color: var(--np-ivory-mute);
        }
        .np-radius-btn:hover { border-color:var(--np-border-gold); color:var(--np-gold-lt); }
        .np-radius-btn.active {
          background: linear-gradient(135deg, var(--np-emerald) 0%, #1b4332 100%);
          border-color: rgba(82,183,136,0.3);
          color: var(--np-ivory);
          box-shadow: 0 0 0 1px rgba(82,183,136,0.2), 0 4px 16px rgba(0,0,0,0.4);
        }

        /* restaurant row */
        .np-row {
          padding: 24px 32px;
          border-bottom: 1px solid var(--np-border-ash);
          display: flex; align-items: flex-start; justify-content: space-between; gap: 20px;
          transition: background 0.2s;
          position: relative;
        }
        .np-row:last-child { border-bottom: none; }
        .np-row::before {
          content:''; position:absolute; left:0; top:0; bottom:0; width:2px;
          background: transparent;
          transition: background 0.25s;
        }
        .np-row:hover { background: rgba(201,168,76,0.025); }
        .np-row:hover::before { background: linear-gradient(180deg, transparent, var(--np-gold), transparent); }

        /* icon box */
        .np-icon-box {
          width:44px; height:44px; border-radius:2px; flex-shrink:0;
          background:rgba(255,255,255,0.03);
          border:1px solid var(--np-border-ash);
          display:flex; align-items:center; justify-content:center;
          font-size:20px;
          transition: border-color 0.25s;
        }
        .np-row:hover .np-icon-box { border-color:var(--np-border-gold); }

        /* action buttons */
        .np-action {
          width:36px; height:36px; border-radius:1px;
          display:flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,0.03); border:1px solid var(--np-border-ash);
          cursor:pointer; transition:all 0.22s; color:var(--np-ivory-mute);
          flex-shrink:0;
        }
        .np-action:hover { border-color:var(--np-border-gold); color:var(--np-gold-lt); background:var(--np-gold-pale); }
        .np-action.map-btn:hover { border-color:rgba(96,165,250,0.4); color:#93c5fd; background:rgba(96,165,250,0.07); }
        .np-action.star-active { border-color:rgba(201,168,76,0.4); color:var(--np-gold); background:var(--np-gold-pale); }

        /* error */
        .np-error {
          border:1px solid rgba(248,113,113,0.25);
          background:rgba(248,113,113,0.05);
          border-radius:2px; padding:16px 20px;
          display:flex; align-items:flex-start; gap:12px;
          margin-bottom:20px;
        }

        /* empty state */
        .np-empty { padding:64px 24px; text-align:center; }

        /* spinner */
        @keyframes np-spin { to{transform:rotate(360deg);} }
        .np-spinner {
          width:36px; height:36px;
          border:2px solid var(--np-border-ash);
          border-top-color:var(--np-gold);
          border-radius:50%;
          animation:np-spin 0.9s linear infinite;
          margin:0 auto 16px;
        }

        /* coord pill */
        .np-coord {
          display:inline-flex; align-items:center; gap:6px;
          background:rgba(255,255,255,0.03);
          border:1px solid var(--np-border-gold);
          border-radius:1px; padding:7px 14px;
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.1em;
          color:var(--np-ivory-dim);
        }

        /* refresh btn */
        .np-refresh {
          width:34px; height:34px; border-radius:1px;
          background:rgba(255,255,255,0.03); border:1px solid var(--np-border-ash);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all 0.22s; color:var(--np-ivory-mute);
        }
        .np-refresh:hover { border-color:var(--np-em-lt); color:var(--np-em-lt); }
        .np-refresh:disabled { opacity:0.4; cursor:not-allowed; }

        /* tip */
        .np-tip {
          background:var(--np-graphite); border:1px solid var(--np-border-ash);
          border-radius:2px; padding:20px 24px;
          display:flex; align-items:flex-start; gap:14px;
          margin-top:20px;
        }

        @keyframes np-fade-up { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;} }
        .np-fade-up { animation:np-fade-up 0.5s cubic-bezier(.16,1,.3,1) both; }

        .np-scrollbar::-webkit-scrollbar { width:3px; }
        .np-scrollbar::-webkit-scrollbar-track { background:transparent; }
        .np-scrollbar::-webkit-scrollbar-thumb { background:var(--np-ash); border-radius:2px; }
      `}</style>

      <div className="np-root">
        <div className="np-bg-grid" />
        <div className="np-bg-orb-1" />
        <div className="np-bg-orb-2" />

        <div style={{ position: "relative", zIndex: 1 }}>
          <NavBar />

          <main style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px" }}>

            {/* ── HEADER ── */}
            <div className="np-card-gold np-corners np-fade-up" style={{ padding: "40px 44px", marginBottom: 20 }}>
              <div className="ncc-bl" /><div className="ncc-br" />
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
                <div>
                  <div className="np-badge np-badge-em" style={{ marginBottom: 16 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--np-em-bright)", display: "inline-block" }} />
                    Yaqin atrofdagi restoranlar
                  </div>
                  <h1 className="np-display" style={{ fontSize: "clamp(28px, 4vw, 48px)", color: "var(--np-ivory)", marginBottom: 10 }}>
                    Atrofingizdagi{" "}
                    <em style={{ fontStyle: "italic", fontWeight: 300, color: "var(--np-gold-lt)" }}>eng yaxshi</em>{" "}
                    joylar
                  </h1>
                  <p style={{ color: "var(--np-ivory-mute)", fontSize: 14, lineHeight: 1.7, maxWidth: 500 }}>
                    Lokatsiyangiz bo'yicha eng yaqin restoranlarni toping va sevimlilaringizga qo'shing
                  </p>
                </div>

                {location && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="np-coord">
                      <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </div>
                    <button onClick={getCurrentLocation} disabled={loading} className="np-refresh" title="Yangilash">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── RADIUS FILTER ── */}
            {location && (
              <div className="np-card np-fade-up" style={{ padding: "18px 28px", marginBottom: 20, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="14" height="14" fill="none" stroke="var(--np-gold)" strokeOpacity="0.7" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--np-ivory-mute)" }}>
                    Qidiruv radiusi
                  </span>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 3, 5].map((r) => (
                    <button key={r} onClick={() => handleRadiusChange(r)} className={`np-radius-btn ${searchRadius === r ? "active" : ""}`}>
                      {r} km
                    </button>
                  ))}
                </div>

                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--np-ivory-mute)" }}>
                  {restaurants.length} ta topildi
                </div>
              </div>
            )}

            {/* ── ERROR ── */}
            {error && (
              <div className="np-error np-fade-up">
                <svg width="16" height="16" fill="none" stroke="#f87171" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p style={{ color: "#f87171", fontWeight: 500, fontSize: 14 }}>{error}</p>
                  {error.includes("topilmadi") && (
                    <p style={{ color: "rgba(248,113,113,0.7)", fontSize: 12, marginTop: 4 }}>
                      Kattaroq radius tanlab ko'ring yoki boshqa hududda qidiring
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── RESTAURANTS LIST ── */}
            {location && (
              <div className="np-card-gold np-fade-up" style={{ overflow: "hidden" }}>

                {/* List header */}
                <div style={{
                  padding: "20px 32px 16px",
                  borderBottom: "1px solid var(--np-border-ash)",
                  display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                  <div className="np-ornament" style={{ marginBottom: 0 }}>
                    <span>Restoranlar ro'yxati</span>
                  </div>
                  <span className="np-badge np-badge-gold">{restaurants.length} ta</span>
                </div>

                {loadingRestaurants ? (
                  <div className="np-empty">
                    <div className="np-spinner" />
                    <p style={{ color: "var(--np-ivory-mute)", fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                      Restoranlar yuklanmoqda
                    </p>
                  </div>

                ) : restaurants.length > 0 ? (
                  <div className="np-scrollbar" style={{ maxHeight: 640, overflowY: "auto" }}>
                    {restaurants.map((restaurant) => {
                      const isFav = isRestaurantFavorite(restaurant.id);
                      return (
                        <div key={restaurant.id} className="np-row">
                          {/* Icon */}
                          <div className="np-icon-box">🏪</div>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 8 }}>
                              <h3 className="np-display" style={{ fontSize: 20, color: "var(--np-ivory)" }}>
                                {restaurant.name}
                              </h3>
                              {isFav && (
                                <span className="np-badge np-badge-gold">
                                  ✦ Favorit
                                </span>
                              )}
                            </div>

                            {/* Address */}
                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--np-ivory-mute)", fontSize: 13, marginBottom: 10 }}>
                              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                              {restaurant.address_text}
                            </div>

                            {/* Tags row */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                              {renderDistance(restaurant)}

                              {restaurant.phone && (
                                <a href={`tel:${restaurant.phone}`} style={{
                                  display: "inline-flex", alignItems: "center", gap: 5,
                                  fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.1em",
                                  color: "var(--np-ivory-mute)", background: "rgba(255,255,255,0.03)",
                                  border: "1px solid var(--np-border-ash)", borderRadius: 1, padding: "3px 10px",
                                  textDecoration: "none", transition: "color 0.2s, border-color 0.2s",
                                }}>
                                  <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {restaurant.phone}
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
                            <a
                              href={getGoogleMapsUrl(restaurant.lat, restaurant.lng)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="np-action map-btn"
                              title="Google Maps da ko'rish"
                            >
                              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                              </svg>
                            </a>

                            <button
                              onClick={() => handleToggleFavoriteRestaurant(restaurant)}
                              className={`np-action ${isFav ? "star-active" : ""}`}
                              title={isFav ? "Favoritdan olib tashlash" : "Favoritga qo'shish"}
                            >
                              <svg width="15" height="15" fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                ) : (
                  <div className="np-empty">
                    <div style={{
                      width: 56, height: 56, borderRadius: 2, margin: "0 auto 20px",
                      background: "rgba(255,255,255,0.03)", border: "1px solid var(--np-border-ash)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="24" height="24" fill="none" stroke="var(--np-ivory-mute)" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p style={{ color: "var(--np-ivory-dim)", fontWeight: 500, marginBottom: 6 }}>Yaqin atrofda restoran topilmadi</p>
                    <p style={{ color: "var(--np-ivory-mute)", fontSize: 13 }}>
                      Kattaroq radius tanlab ko'ring yoki boshqa hududda qidiring
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── TIP ── */}
            {!loading && restaurants.length > 0 && (
              <div className="np-tip np-fade-up">
                <div style={{ color: "var(--np-gold)", fontSize: 18, flexShrink: 0, marginTop: 2 }}>◈</div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14, color: "var(--np-ivory)", marginBottom: 6 }}>Maslahat</div>
                  <p style={{ fontSize: 13, color: "var(--np-ivory-mute)", lineHeight: 1.7 }}>
                    Restoranlarni favoritlarga qo'shing va ularni tezda toping.
                    Har bir restoran uchun telefon raqami va Google Maps manzili mavjud.
                  </p>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  );
}