// components/NavBar.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getProfile, logoutAndRedirect } from "@/lib/api";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Function to fetch user data
  const fetchUserData = async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setUser(null);
      setIsLoadingUser(false);
      return;
    }

    try {
      const userData = await getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Check initial theme
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  // Check authentication and fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Listen for auth changes (login/logout)
  useEffect(() => {
    const handleAuthChange = () => {
      fetchUserData();
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setSettingsOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Toggle theme
  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsOpen && !event.target.closest('.settings-dropdown')) {
        setSettingsOpen(false);
      }
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsOpen, userMenuOpen]);

  const handleLogout = () => {
    logoutAndRedirect();
  };

  const navLinks = [
    {
      href: "/compare",
      label: "Solishtirish",
      icon: (
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      href: "/nearby",
      label: "Yaqin atrofda",
      icon: (
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      href: "/favorites",
      label: "Sevimlilar",
      icon: (
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
  ];

  const isActive = (href) => pathname === href;

  // Get user initial for avatar
  const getUserInitial = () => {
    if (!user) return '?';
    if (user.username) return user.username.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return '';
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,300&family=DM+Mono:wght@300;400&family=Jost:wght@300;400;500&display=swap');

        /* ── NavBar shell ── */
        .tnav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          height: 68px;
          display: flex;
          align-items: center;
          transition: background 0.4s cubic-bezier(.16,1,.3,1),
                      border-color 0.4s cubic-bezier(.16,1,.3,1),
                      box-shadow 0.4s cubic-bezier(.16,1,.3,1);
          background: transparent;
          border-bottom: 1px solid transparent;
        }
        .tnav.scrolled {
          background: rgba(14,14,14,0.88);
          border-bottom-color: rgba(201,168,76,0.14);
          box-shadow: 0 8px 40px rgba(0,0,0,0.5);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .dark .tnav.scrolled {
          background: rgba(14,14,14,0.95);
        }

        /* gradient line at top when scrolled */
        .tnav::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(201,168,76,0.5) 30%,
            rgba(116,198,157,0.5) 70%,
            transparent 100%
          );
          opacity: 0;
          transition: opacity 0.4s;
        }
        .tnav.scrolled::before { opacity: 1; }

        .tnav-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 28px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        /* ── Logo ── */
        .tnav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          flex-shrink: 0;
          position: relative;
        }
        .tnav-logo-mark {
          width: 36px;
          height: 36px;
          border-radius: 2px;
          background: linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%);
          border: 1px solid rgba(82,183,136,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          flex-shrink: 0;
          box-shadow: 0 0 0 1px rgba(82,183,136,0.1), 0 4px 16px rgba(0,0,0,0.3);
          transition: box-shadow 0.3s, border-color 0.3s;
          position: relative;
          overflow: hidden;
        }
        .tnav-logo-mark::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(116,198,157,0.15), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .tnav-logo:hover .tnav-logo-mark {
          border-color: rgba(82,183,136,0.6);
          box-shadow: 0 0 0 1px rgba(82,183,136,0.25), 0 0 20px rgba(45,106,79,0.25), 0 4px 20px rgba(0,0,0,0.4);
        }
        .tnav-logo:hover .tnav-logo-mark::after { opacity: 1; }

        .tnav-logo-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .tnav-logo-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          font-size: 22px;
          color: #f5f0e8;
          letter-spacing: -0.01em;
          line-height: 1;
          transition: color 0.2s;
        }
        .dark .tnav-logo-name { color: #f5f0e8; }
        .tnav-logo:hover .tnav-logo-name { color: #e6c97a; }
        .tnav-logo-sub {
          font-family: 'DM Mono', monospace;
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #7a7168;
          line-height: 1;
          transition: color 0.2s;
        }
        .tnav-logo:hover .tnav-logo-sub { color: #52b788; }

        /* thin gold separator between logo and nav */
        .tnav-sep {
          width: 1px;
          height: 24px;
          background: linear-gradient(180deg, transparent, rgba(201,168,76,0.3), transparent);
          flex-shrink: 0;
        }

        /* ── Nav links (desktop) ── */
        .tnav-links {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
          justify-content: flex-end;
        }
        .tnav-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border-radius: 1px;
          text-decoration: none;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.04em;
          color: #7a7168;
          border: 1px solid transparent;
          transition: color 0.22s, background 0.22s, border-color 0.22s;
          position: relative;
          white-space: nowrap;
        }
        .tnav-link svg { opacity: 0.6; transition: opacity 0.22s; flex-shrink: 0; }
        .tnav-link:hover {
          color: #c8bfa8;
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.07);
        }
        .tnav-link:hover svg { opacity: 1; }

        /* active state */
        .tnav-link.active {
          color: #e6c97a;
          background: rgba(201,168,76,0.07);
          border-color: rgba(201,168,76,0.18);
        }
        .tnav-link.active svg { opacity: 1; color: #74c69d; }

        /* active dot indicator */
        .tnav-link.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #c9a84c, transparent);
        }

        /* ── Icon buttons (theme & settings) ── */
        .tnav-icons {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-right: 8px;
        }
        .tnav-icon-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s;
          color: #7a7168;
        }
        .tnav-icon-btn:hover {
          border-color: rgba(201,168,76,0.35);
          color: #c9a84c;
          transform: translateY(-1px);
        }

        /* Settings dropdown */
        .settings-dropdown {
          position: relative;
        }
        .settings-menu {
          position: absolute;
          top: 48px;
          right: 0;
          width: 220px;
          background: rgba(22,22,22,0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 2px;
          padding: 8px 0;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-8px);
          transition: all 0.25s;
          z-index: 101;
        }
        .settings-menu.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .settings-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          cursor: pointer;
          transition: background 0.2s;
          color: #c8bfa8;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
        }
        .settings-item:hover {
          background: rgba(201,168,76,0.1);
        }
        .settings-item svg {
          width: 16px;
          height: 16px;
          opacity: 0.7;
        }
        .settings-divider {
          height: 1px;
          background: rgba(201,168,76,0.1);
          margin: 6px 0;
        }

        /* ── User Avatar / Account Menu ── */
        .user-menu {
          position: relative;
        }
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--emerald) 0%, #1b4332 100%);
          border: 1px solid rgba(82,183,136,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s;
          color: var(--ivory);
          font-family: 'Jost', sans-serif;
          font-size: 16px;
          font-weight: 500;
        }
        .user-avatar:hover {
          border-color: var(--gold);
          transform: translateY(-1px);
          box-shadow: 0 0 0 2px rgba(201,168,76,0.2);
        }
        .user-dropdown {
          position: absolute;
          top: 48px;
          right: 0;
          width: 240px;
          background: rgba(22,22,22,0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 2px;
          padding: 8px 0;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-8px);
          transition: all 0.25s;
          z-index: 101;
        }
        .user-dropdown.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .user-info {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(201,168,76,0.1);
          margin-bottom: 8px;
        }
        .user-name {
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: var(--ivory);
          margin-bottom: 4px;
        }
        .user-email {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--ivory-mute);
          letter-spacing: 0.05em;
        }
        .user-role {
          display: inline-block;
          padding: 2px 8px;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 1px;
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          color: var(--gold-lt);
          margin-top: 6px;
        }
        .user-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          cursor: pointer;
          transition: background 0.2s;
          color: var(--ivory-dim);
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          text-decoration: none;
        }
        .user-menu-item:hover {
          background: rgba(201,168,76,0.1);
          color: var(--gold-lt);
        }
        .user-menu-item svg {
          width: 16px;
          height: 16px;
          opacity: 0.7;
        }

        /* ── Login CTA ── */
        .tnav-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 20px;
          background: linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%);
          color: #f5f0e8;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.06em;
          border-radius: 1px;
          text-decoration: none;
          border: 1px solid rgba(82,183,136,0.3);
          box-shadow: 0 0 0 1px rgba(82,183,136,0.1), 0 4px 16px rgba(0,0,0,0.3);
          transition: box-shadow 0.3s, transform 0.3s, border-color 0.3s;
          flex-shrink: 0;
          white-space: nowrap;
          position: relative;
          overflow: hidden;
        }
        .tnav-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(116,198,157,0.12), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .tnav-cta:hover {
          border-color: rgba(82,183,136,0.5);
          box-shadow: 0 0 0 1px rgba(82,183,136,0.2), 0 0 20px rgba(45,106,79,0.2), 0 6px 24px rgba(0,0,0,0.4);
          transform: translateY(-1px);
        }
        .tnav-cta:hover::before { opacity: 1; }

        /* ── Mobile hamburger ── */
        .tnav-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          width: 36px;
          height: 36px;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1px;
          cursor: pointer;
          transition: border-color 0.2s;
          flex-shrink: 0;
        }
        .tnav-hamburger:hover { border-color: rgba(201,168,76,0.25); }
        .tnav-hamburger span {
          display: block;
          width: 16px;
          height: 1px;
          background: #7a7168;
          transition: all 0.25s cubic-bezier(.16,1,.3,1);
          transform-origin: center;
        }
        .tnav-hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); background: #c9a84c; }
        .tnav-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .tnav-hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); background: #c9a84c; }

        /* ── Mobile drawer ── */
        .tnav-drawer {
          position: fixed;
          top: 68px;
          left: 0;
          right: 0;
          background: rgba(14,14,14,0.97);
          border-bottom: 1px solid rgba(201,168,76,0.14);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 99;
          padding: 16px 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transform: translateY(-8px);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.3s cubic-bezier(.16,1,.3,1), opacity 0.3s;
        }
        .tnav-drawer.open {
          transform: translateY(0);
          opacity: 1;
          pointer-events: all;
        }
        .tnav-drawer-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 14px;
          border-radius: 1px;
          text-decoration: none;
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: #7a7168;
          border: 1px solid transparent;
          transition: all 0.2s;
        }
        .tnav-drawer-link svg { opacity: 0.5; transition: opacity 0.2s; }
        .tnav-drawer-link:hover {
          color: #c8bfa8;
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.06);
        }
        .tnav-drawer-link:hover svg { opacity: 1; }
        .tnav-drawer-link.active {
          color: #e6c97a;
          background: rgba(201,168,76,0.06);
          border-color: rgba(201,168,76,0.16);
        }
        .tnav-drawer-link.active svg { opacity: 1; color: #74c69d; }
        .tnav-drawer-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent);
          margin: 10px 0;
        }
        .tnav-drawer-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 20px;
          background: linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%);
          color: #f5f0e8;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.06em;
          border-radius: 1px;
          text-decoration: none;
          border: 1px solid rgba(82,183,136,0.3);
          margin-top: 4px;
        }

        /* Mobile drawer icons section */
        .tnav-drawer-icons {
          display: flex;
          gap: 16px;
          justify-content: center;
          padding: 12px 0;
          margin-top: 8px;
        }
        .tnav-drawer-icon-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 1px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #7a7168;
          transition: all 0.25s;
        }
        .tnav-drawer-icon-btn:hover {
          border-color: #c9a84c;
          color: #c9a84c;
        }

        /* ── Responsive breakpoint ── */
        @media (max-width: 720px) {
          .tnav-links { display: none; }
          .tnav-cta-desktop { display: none; }
          .tnav-icons { display: none; }
          .tnav-sep { display: none; }
          .tnav-hamburger { display: flex; }
          .user-menu { display: none; }
        }
        @media (min-width: 721px) {
          .tnav-drawer { display: none !important; }
          .mobile-user-menu { display: none; }
        }
      `}</style>

      {/* ── Fixed nav bar ── */}
      <nav className={`tnav${scrolled ? " scrolled" : ""}`}>
        <div className="tnav-inner">

          {/* Logo */}
          <Link href="/" className="tnav-logo">
            <div className="tnav-logo-mark">💰</div>
            <div className="tnav-logo-text">
              <span className="tnav-logo-name">TopNarx</span>
              <span className="tnav-logo-sub">Narx solishtirish</span>
            </div>
          </Link>

          {/* Separator */}
          <div className="tnav-sep" />

          {/* Desktop nav links */}
          <div className="tnav-links">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`tnav-link${isActive(link.href) ? " active" : ""}`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Icons: Theme + Settings */}
          <div className="tnav-icons">
            {/* Dark/Light Toggle */}
            <button className="tnav-icon-btn" onClick={toggleTheme} aria-label="Theme">
              {isDarkMode ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Settings Dropdown */}
            <div className="settings-dropdown">
              <button
                className="tnav-icon-btn"
                onClick={() => setSettingsOpen(!settingsOpen)}
                aria-label="Settings"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div className={`settings-menu ${settingsOpen ? "open" : ""}`}>
                <div className="settings-item" onClick={() => alert("Ovoz sozlamalari")}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <span>Ovoz</span>
                </div>
                <div className="settings-item" onClick={() => alert("Bildirishnoma sozlamalari")}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span>Bildirishnomalar</span>
                </div>
                <div className="settings-divider" />
                <div className="settings-item" onClick={() => alert("Til sozlamalari")}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span>Til</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop CTA - Account Avatar or Login Button */}
          {!isLoadingUser && (
            user ? (
              <div className="user-menu">
                <div className="user-avatar" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  {getUserInitial()}
                </div>
                <div className={`user-dropdown ${userMenuOpen ? "open" : ""}`}>
                  <div className="user-info">
                    <div className="user-name">{getUserDisplayName()}</div>
                    <div className="user-email">{user.email}</div>
                    <div className="user-role">
                      {user.role === 'owner' ? 'Do\'kon egasi' : 'Oddiy foydalanuvchi'}
                    </div>
                  </div>
                  <Link href={user.role === 'owner' ? "/owner/dashboard" : "/profile"} className="user-menu-item">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profil
                  </Link>
                  <Link href="/favorites" className="user-menu-item">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Sevimlilar
                  </Link>
                  <div className="settings-divider" />
                  <div className="user-menu-item" onClick={handleLogout}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Chiqish
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="tnav-cta tnav-cta-desktop">
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Kirish
              </Link>
            )
          )}

          {/* Mobile hamburger */}
          <button
            className={`tnav-hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menyu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      <div className={`tnav-drawer${menuOpen ? " open" : ""}`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`tnav-drawer-link${isActive(link.href) ? " active" : ""}`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}

        {/* Mobile icons section */}
        <div className="tnav-drawer-icons">
          <button className="tnav-drawer-icon-btn" onClick={toggleTheme}>
            {isDarkMode ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button
            className="tnav-drawer-icon-btn"
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Mobile settings menu inside drawer when open */}
        {settingsOpen && (
          <div style={{ marginTop: 8 }}>
            <div className="tnav-drawer-divider" />
            <div
              className="settings-item"
              onClick={() => { alert("Ovoz sozlamalari"); setSettingsOpen(false); }}
              style={{ padding: "12px 14px" }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <span>Ovoz</span>
            </div>
            <div
              className="settings-item"
              onClick={() => { alert("Bildirishnoma sozlamalari"); setSettingsOpen(false); }}
              style={{ padding: "12px 14px" }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>Bildirishnomalar</span>
            </div>
            <div
              className="settings-item"
              onClick={() => { alert("Til sozlamalari"); setSettingsOpen(false); }}
              style={{ padding: "12px 14px" }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span>Til</span>
            </div>
          </div>
        )}

        <div className="tnav-drawer-divider" />

        {/* Mobile CTA - Account or Login */}
        {!isLoadingUser && (
          user ? (
            <>
              <div className="tnav-drawer-cta" style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.2)", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "18px", fontWeight: "500"
                  }}>
                    {getUserInitial()}
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: "500", fontSize: "14px" }}>{getUserDisplayName()}</div>
                    <div style={{ fontSize: "11px", color: "var(--ivory-mute)" }}>{user.email}</div>
                    <div style={{
                      fontSize: "9px", fontFamily: "'DM Mono', monospace",
                      color: "var(--gold-lt)", marginTop: "2px"
                    }}>
                      {user.role === 'owner' ? 'Do\'kon egasi' : 'Oddiy foydalanuvchi'}
                    </div>
                  </div>
                </div>
              </div>
              <Link href={user.role === 'owner' ? "/owner/dashboard" : "/profile"} className="tnav-drawer-cta" style={{ marginTop: "8px" }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profil
              </Link>
              <Link href="/favorites" className="tnav-drawer-cta" style={{ marginTop: "4px" }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Sevimlilar
              </Link>
              <div className="tnav-drawer-cta" onClick={handleLogout} style={{ cursor: "pointer" }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Chiqish
              </div>
            </>
          ) : (
            <Link href="/login" className="tnav-drawer-cta">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Kirish / Ro'yxatdan o'tish
            </Link>
          )
        )}
      </div>
      {/* Spacer so content sits below fixed nav */}
      <div style={{ height: 68 }} />
    </>
  );
}