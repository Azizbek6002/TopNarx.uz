// frontend/app/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, registerUser, saveAuthData } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurantName, setRestaurantName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function redirectByRole(role) {
    if (role === "owner") { router.push("/owner/dashboard"); return; }
    router.push("/compare");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await loginUser({ email, password });
      saveAuthData(data);
      redirectByRole(data?.user?.role);
    } catch (err) {
      setError(err.message || "Kirishda xatolik");
    } finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await registerUser({ username, email, password, role: selectedRole });
      const loginData = await loginUser({ email, password });
      saveAuthData(loginData);
      if (selectedRole === "owner" && restaurantName.trim()) {
        localStorage.setItem("pending_restaurant_name", restaurantName.trim());
      }
      redirectByRole(loginData?.user?.role);
    } catch (err) {
      setError(err.message || "Ro'yxatdan o'tishda xatolik");
    } finally { setLoading(false); }
  }

  const submitHandler = isRegistering ? handleRegister : handleLogin;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,600&family=DM+Mono:wght@300;400&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --coal:       #0e0e0e;
          --charcoal:   #161616;
          --graphite:   #1e1e1e;
          --ash:        #2a2a2a;
          --smoke:      #3d3d3d;
          --ivory:      #f5f0e8;
          --ivory-dim:  #c8bfa8;
          --ivory-mute: #7a7168;
          --gold:       #c9a84c;
          --gold-lt:    #e6c97a;
          --gold-dk:    #8a6a25;
          --gold-pale:  rgba(201,168,76,0.08);
          --emerald:    #2d6a4f;
          --em-lt:      #52b788;
          --em-bright:  #74c69d;
          --border-gold: rgba(201,168,76,0.2);
          --border-ash:  rgba(255,255,255,0.07);
        }

        .ln-root {
          min-height: 100vh;
          background: var(--coal);
          color: var(--ivory);
          font-family: 'Jost', system-ui, sans-serif;
          font-weight: 300;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .ln-display { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 600; letter-spacing: -0.01em; }
        .ln-display-italic { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-weight: 300; }
        .ln-mono { font-family: 'DM Mono', monospace; font-weight: 300; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; }

        /* Background */
        .ln-bg-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .ln-bg-orb-1 {
          position: fixed; top: -20%; right: -15%;
          width: 50vw; height: 50vw; border-radius: 50%;
          background: radial-gradient(circle, rgba(45,106,79,0.07) 0%, transparent 65%);
          pointer-events: none; z-index: 0;
        }
        .ln-bg-orb-2 {
          position: fixed; bottom: 5%; left: -20%;
          width: 40vw; height: 40vw; border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 65%);
          pointer-events: none; z-index: 0;
        }

        /* Layout */
        .ln-wrap { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 20px; }

        /* Logo bar */
        .ln-logo-link { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
        .ln-logo-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--emerald) 0%, #1b4332 100%);
          border: 1px solid rgba(82,183,136,0.3);
          border-radius: 2px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }

        /* Role selection cards */
        .ln-role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; max-width: 680px; margin-top: 40px; }
        @media (max-width: 600px) { .ln-role-grid { grid-template-columns: 1fr; } }

        .ln-role-card {
          background: var(--graphite);
          border: 1px solid var(--border-ash);
          border-radius: 2px;
          padding: 36px 30px;
          text-align: left;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s, transform 0.35s cubic-bezier(.16,1,.3,1), box-shadow 0.35s cubic-bezier(.16,1,.3,1);
          width: 100%;
        }
        .ln-role-card::before {
          content: '';
          position: absolute;
          top: 0; left: 40px;
          width: 36px; height: 2px;
          transition: width 0.3s;
        }
        .ln-role-card.user::before { background: var(--em-lt); }
        .ln-role-card.owner::before { background: var(--gold); }
        .ln-role-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .ln-role-card.user:hover { border-color: rgba(82,183,136,0.35); }
        .ln-role-card.owner:hover { border-color: var(--border-gold); }

        .ln-role-badge {
          display: inline-flex;
          align-items: center;
          border-radius: 1px;
          padding: 4px 12px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .ln-role-badge.user { background: rgba(82,183,136,0.1); border: 1px solid rgba(82,183,136,0.25); color: var(--em-bright); }
        .ln-role-badge.owner { background: var(--gold-pale); border: 1px solid rgba(201,168,76,0.25); color: var(--gold-lt); }

        /* Form card */
        .ln-form-card {
          background: var(--charcoal);
          border: 1px solid var(--border-gold);
          border-radius: 2px;
          padding: 48px 44px;
          width: 100%;
          max-width: 480px;
          position: relative;
          overflow: hidden;
        }
        .ln-form-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--gold) 30%, var(--em-bright) 70%, transparent);
        }
        /* Art Deco corners */
        .ln-corner { position: absolute; width: 20px; height: 20px; }
        .ln-corner.tl { top: 12px; left: 12px; border-top: 1px solid var(--border-gold); border-left: 1px solid var(--border-gold); }
        .ln-corner.tr { top: 12px; right: 12px; border-top: 1px solid var(--border-gold); border-right: 1px solid var(--border-gold); }
        .ln-corner.bl { bottom: 12px; left: 12px; border-bottom: 1px solid var(--border-gold); border-left: 1px solid var(--border-gold); }
        .ln-corner.br { bottom: 12px; right: 12px; border-bottom: 1px solid var(--border-gold); border-right: 1px solid var(--border-gold); }

        /* Tab switcher */
        .ln-tabs {
          display: flex;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-ash);
          border-radius: 1px;
          padding: 3px;
          margin: 28px 0;
        }
        .ln-tab {
          flex: 1;
          padding: 11px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 400;
          border: none;
          border-radius: 1px;
          cursor: pointer;
          transition: all 0.25s;
          background: transparent;
          color: var(--ivory-mute);
        }
        .ln-tab.active {
          background: linear-gradient(135deg, var(--emerald) 0%, #1b4332 100%);
          color: var(--ivory);
          box-shadow: 0 2px 12px rgba(0,0,0,0.4);
        }

        /* Inputs */
        .ln-field { margin-bottom: 18px; }
        .ln-label {
          display: block;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ivory-mute);
          margin-bottom: 8px;
        }
        .ln-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-ash);
          border-radius: 1px;
          padding: 13px 16px;
          color: var(--ivory);
          font-family: 'Jost', sans-serif;
          font-size: 15px;
          font-weight: 300;
          outline: none;
          transition: border-color 0.25s, background 0.25s;
          -webkit-appearance: none;
        }
        .ln-input::placeholder { color: var(--ivory-mute); font-size: 14px; }
        .ln-input:focus { border-color: rgba(201,168,76,0.5); background: rgba(201,168,76,0.03); }
        .ln-input:focus::placeholder { color: transparent; }

        /* Submit button */
        .ln-submit {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, var(--emerald) 0%, #1b4332 100%);
          border: none;
          border-radius: 1px;
          color: var(--ivory);
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.2s;
          box-shadow: 0 0 0 1px rgba(82,183,136,0.3), 0 8px 32px rgba(0,0,0,0.4);
          margin-top: 8px;
          position: relative;
          overflow: hidden;
        }
        .ln-submit::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(116,198,157,0.12), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .ln-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 0 1px var(--em-lt), 0 16px 48px rgba(0,0,0,0.5); }
        .ln-submit:hover::before { opacity: 1; }
        .ln-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        /* Error */
        .ln-error {
          border: 1px solid rgba(248,113,113,0.3);
          background: rgba(248,113,113,0.06);
          border-radius: 1px;
          padding: 12px 16px;
          color: #f87171;
          font-size: 13px;
          margin-bottom: 18px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.06em;
        }

        /* Back link */
        .ln-back {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--gold);
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s;
          margin-top: 6px;
          display: inline-block;
        }
        .ln-back:hover { color: var(--gold-lt); }

        /* Hint text */
        .ln-hint { font-size: 11px; color: var(--ivory-mute); margin-top: 6px; line-height: 1.5; }

        /* Ornament divider */
        .ln-ornament {
          display: flex; align-items: center; gap: 12px; justify-content: center; margin: 6px 0 20px;
        }
        .ln-ornament::before, .ln-ornament::after {
          content: ''; display: block; height: 1px; flex: 1;
          background: linear-gradient(90deg, transparent, var(--border-gold));
        }
        .ln-ornament::after { background: linear-gradient(90deg, var(--border-gold), transparent); }
        .ln-ornament span {
          font-family: 'DM Mono', monospace; font-size: 9px;
          letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); opacity: 0.6;
        }

        /* Animations */
        @keyframes ln-fade-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        .ln-fade-up { animation: ln-fade-up 0.6s cubic-bezier(.16,1,.3,1) both; }
        .ln-fade-up-2 { animation: ln-fade-up 0.6s 0.08s cubic-bezier(.16,1,.3,1) both; }
        .ln-fade-up-3 { animation: ln-fade-up 0.6s 0.16s cubic-bezier(.16,1,.3,1) both; }
      `}</style>

      <div className="ln-root">
        <div className="ln-bg-grid" />
        <div className="ln-bg-orb-1" />
        <div className="ln-bg-orb-2" />

        <div className="ln-wrap">

          {/* ── ROLE SELECTION ── */}
          {!selectedRole && (
            <div style={{ width: "100%", maxWidth: 680, textAlign: "center" }} className="ln-fade-up">

              {/* Logo */}
              <Link href="/" className="ln-logo-link" style={{ justifyContent: "center", marginBottom: "32px", display: "inline-flex" }}>
                <div className="ln-logo-icon">💰</div>
                <span className="ln-display" style={{ fontSize: "26px", color: "var(--ivory)", marginLeft: "10px" }}>TopNarx</span>
              </Link>

              <div className="ln-ornament" style={{ maxWidth: 320, margin: "0 auto 20px" }}>
                <span>Narxlarni solishtirish platformasi</span>
              </div>

              <h1 className="ln-display" style={{ fontSize: "clamp(32px, 5vw, 52px)", color: "var(--ivory)", marginBottom: "10px" }}>
                TopNarx ga xush kelibsiz
              </h1>
              <p style={{ color: "var(--ivory-mute)", fontSize: "15px", marginBottom: "8px" }}>
                Kim sifatida kirishni xohlaysiz?
              </p>

              <div className="ln-role-grid">
                {/* User card */}
                <button type="button" onClick={() => setSelectedRole("user")} className="ln-role-card user">
                  <div className="ln-role-badge user">User</div>
                  <h2 className="ln-display" style={{ fontSize: "26px", color: "var(--ivory)", marginBottom: "10px" }}>
                    Oddiy foydalanuvchi
                  </h2>
                  <p style={{ fontSize: "14px", color: "var(--ivory-mute)", lineHeight: 1.7, marginBottom: "20px" }}>
                    Narxlarni solishtiring, yaqin joylarni toping va yoqqan variantlaringizni saqlang.
                  </p>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {[
                      "Restoranlar bo'yicha narxlarni solishtirish",
                      "Yaqin atrofdagi restoranlarni topish",
                      "Login orqali favoritlarni saqlash",
                    ].map((item, i) => (
                      <li key={i} style={{
                        display: "flex", alignItems: "flex-start", gap: "10px",
                        fontSize: "13px", color: "var(--ivory-mute)",
                        marginBottom: "8px", textAlign: "left",
                      }}>
                        <span style={{ color: "var(--em-lt)", flexShrink: 0, marginTop: "1px" }}>◆</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </button>

                {/* Owner card */}
                <button type="button" onClick={() => setSelectedRole("owner")} className="ln-role-card owner">
                  <div className="ln-role-badge owner">Owner</div>
                  <h2 className="ln-display" style={{ fontSize: "26px", color: "var(--ivory)", marginBottom: "10px" }}>
                    Do'kon egasi
                  </h2>
                  <p style={{ fontSize: "14px", color: "var(--ivory-mute)", lineHeight: 1.7, marginBottom: "20px" }}>
                    O'z restoraningizni boshqaring, variantlarga narx kiriting va listingizni yangilang.
                  </p>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {[
                      "Avval restoran ma'lumotini ko'rish",
                      "Mahsulot variantlariga narx kiritish",
                      "O'z narxlaringizni nazorat qilish",
                    ].map((item, i) => (
                      <li key={i} style={{
                        display: "flex", alignItems: "flex-start", gap: "10px",
                        fontSize: "13px", color: "var(--ivory-mute)",
                        marginBottom: "8px", textAlign: "left",
                      }}>
                        <span style={{ color: "var(--gold)", flexShrink: 0, marginTop: "1px" }}>◆</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </button>
              </div>

              <p style={{ marginTop: "32px", fontSize: "12px", color: "var(--ivory-mute)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>
                Davom etish orqali siz TopNarx ning shartlariga rozilik bildirasiz
              </p>
            </div>
          )}

          {/* ── FORM ── */}
          {selectedRole && (
            <div className="ln-fade-up" style={{ width: "100%" }}>
              <div className="ln-form-card" style={{ margin: "0 auto" }}>
                {/* Art Deco corners */}
                <div className="ln-corner tl" /><div className="ln-corner tr" />
                <div className="ln-corner bl" /><div className="ln-corner br" />

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "4px" }}>
                  <Link href="/" className="ln-logo-link" style={{ justifyContent: "center", display: "inline-flex" }}>
                    <div className="ln-logo-icon">💰</div>
                    <span className="ln-display" style={{ fontSize: "24px", color: "var(--ivory)", marginLeft: "10px" }}>TopNarx</span>
                  </Link>

                  <div style={{ marginTop: "20px" }}>
                    <div className={`ln-role-badge ${selectedRole}`} style={{ margin: "0 auto" }}>
                      {selectedRole === "user" ? "User" : "Owner"}
                    </div>
                  </div>

                  <h1 className="ln-display" style={{ fontSize: "30px", color: "var(--ivory)", marginTop: "10px" }}>
                    {selectedRole === "user" ? "Oddiy foydalanuvchi" : "Do'kon egasi"}
                  </h1>

                  <button type="button" onClick={() => setSelectedRole(null)} className="ln-back">
                    ← Boshqa rolni tanlash
                  </button>
                </div>

                {/* Tab switcher */}
                <div className="ln-tabs">
                  <button type="button" onClick={() => setIsRegistering(false)} className={`ln-tab ${!isRegistering ? "active" : ""}`}>
                    Kirish
                  </button>
                  <button type="button" onClick={() => setIsRegistering(true)} className={`ln-tab ${isRegistering ? "active" : ""}`}>
                    Ro'yxat
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={submitHandler}>
                  {error && <div className="ln-error">{error}</div>}

                  {isRegistering && (
                    <div className="ln-field">
                      <label className="ln-label">Username</label>
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="ln-input"
                        placeholder="username"
                        required
                      />
                    </div>
                  )}

                  <div className="ln-field">
                    <label className="ln-label">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="ln-input"
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  <div className="ln-field">
                    <label className="ln-label">Parol</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="ln-input"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {isRegistering && selectedRole === "owner" && (
                    <div className="ln-field">
                      <label className="ln-label">Restoran nomi</label>
                      <input
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        className="ln-input"
                        placeholder="Masalan: Rayhon Coffee"
                      />
                      <p className="ln-hint">Dashboard ichida to'liq ma'lumotlarni keyin kiritasiz.</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="ln-submit">
                    {loading
                      ? "Yuborilmoqda..."
                      : isRegistering
                      ? "Ro'yxatdan o'tish"
                      : "Kirish"}
                  </button>
                </form>

                <p style={{
                  marginTop: "24px",
                  textAlign: "center",
                  fontSize: "11px",
                  color: "var(--ivory-mute)",
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: "0.06em",
                  lineHeight: 1.7,
                }}>
                  Davom etish orqali siz TopNarx ning Foydalanish shartlari va
                  Maxfiylik siyosatiga rozilik bildirasiz.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}