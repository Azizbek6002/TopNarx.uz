"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getOwnerRestaurant,
  createOwnerRestaurant,
  updateOwnerRestaurant,
  getOwnerPrices,
  upsertOwnerPrice,
  searchVariants,
  apiFetch,
} from "@/lib/api";
import NavBar from "@/components/NavBar";

const emptyRestaurantForm = {
  name: "",
  slug: "",
  phone: "",
  address_text: "",
  lat: "",
  lng: "",
};

function normalizeCoordinate(value) {
  return Number(Number(value).toFixed(6));
}

function formatNumber(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString("ru-RU");
}

function normalizePriceRows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function normalizeVariantRows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function makeSlug(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/['’`"]/g, "")
    .replace(/[^a-z0-9а-яёўқғҳ\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function OwnerDashboardPage() {
  const [user, setUser] = useState(null);

  const [restaurantLoading, setRestaurantLoading] = useState(true);
  const [restaurantError, setRestaurantError] = useState("");
  const [restaurantSuccess, setRestaurantSuccess] = useState("");
  const [restaurant, setRestaurant] = useState(null);
  const [restaurantForm, setRestaurantForm] = useState(emptyRestaurantForm);
  const [editingRestaurant, setEditingRestaurant] = useState(false);
  const [savingRestaurant, setSavingRestaurant] = useState(false);

  const [pricesLoading, setPricesLoading] = useState(true);
  const [prices, setPrices] = useState([]);

  const [variantQuery, setVariantQuery] = useState("");
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantResults, setVariantResults] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [priceAmount, setPriceAmount] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);
  const [priceMessage, setPriceMessage] = useState("");
  const [priceMessageType, setPriceMessageType] = useState("success");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [priceToDelete, setPriceToDelete] = useState(null);
  const [deletingPrice, setDeletingPrice] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);

    if (storedUser && storedUser.role && storedUser.role !== "owner") {
      setRestaurantLoading(false);
      setPricesLoading(false);
      return;
    }

    bootstrap();
  }, []);

  async function bootstrap() {
    await Promise.all([loadRestaurantData(), loadOwnerPrices()]);
  }

  function fillRestaurantForm(data) {
    setRestaurantForm({
      name: data?.name || "",
      slug: data?.slug || "",
      phone: data?.phone || "",
      address_text: data?.address_text || "",
      lat: data?.lat ?? "",
      lng: data?.lng ?? "",
    });
  }

  async function loadRestaurantData() {
    setRestaurantLoading(true);
    setRestaurantError("");
    setRestaurantSuccess("");

    try {
      const data = await getOwnerRestaurant();
      setRestaurant(data);
      fillRestaurantForm(data);
    } catch (error) {
      const message = String(error?.message || "").toLowerCase();

      if (message.includes("404") || message.includes("topilmadi")) {
        const pendingName =
          typeof window !== "undefined"
            ? localStorage.getItem("pending_restaurant_name") || ""
            : "";

        setRestaurant(null);
        setRestaurantForm({
          ...emptyRestaurantForm,
          name: pendingName,
          slug: pendingName ? makeSlug(pendingName) : "",
        });
      } else {
        setRestaurantError(error.message || "Restoran ma'lumotini yuklab bo'lmadi");
      }
    } finally {
      setRestaurantLoading(false);
    }
  }

  async function loadOwnerPrices() {
    setPricesLoading(true);

    try {
      const data = await getOwnerPrices();
      setPrices(normalizePriceRows(data));
    } catch (error) {
      setPrices([]);
    } finally {
      setPricesLoading(false);
    }
  }

  function handleRestaurantChange(e) {
    const { name, value } = e.target;

    setRestaurantForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "name") {
        const oldAuto = makeSlug(prev.name);
        const currentSlug = String(prev.slug || "").trim();

        if (!currentSlug || currentSlug === oldAuto) {
          next.slug = makeSlug(value);
        }
      }

      return next;
    });
  }

  async function handleCreateRestaurant(e) {
    e.preventDefault();
    setSavingRestaurant(true);
    setRestaurantError("");
    setRestaurantSuccess("");

    try {
      const payload = {
        name: restaurantForm.name.trim(),
        slug: restaurantForm.slug.trim(),
        phone: restaurantForm.phone.trim(),
        address_text: restaurantForm.address_text.trim(),
        lat:
          restaurantForm.lat === ""
            ? null
            : Number(Number(restaurantForm.lat).toFixed(6)),
        lng:
          restaurantForm.lng === ""
            ? null
            : Number(Number(restaurantForm.lng).toFixed(6)),
      };

      const data = await createOwnerRestaurant(payload);

      setRestaurant(data);
      fillRestaurantForm(data);
      setRestaurantSuccess("Restoran muvaffaqiyatli yaratildi");
      setEditingRestaurant(false);

      if (typeof window !== "undefined") {
        localStorage.removeItem("pending_restaurant_name");
      }
    } catch (error) {
      setRestaurantError(error.message || "Restoran yaratishda xatolik");
    } finally {
      setSavingRestaurant(false);
    }
  }

  async function handleUpdateRestaurant(e) {
    e.preventDefault();
    setSavingRestaurant(true);
    setRestaurantError("");
    setRestaurantSuccess("");

    try {
      const payload = {
        name: restaurantForm.name.trim(),
        slug: restaurantForm.slug.trim(),
        phone: restaurantForm.phone.trim(),
        address_text: restaurantForm.address_text.trim(),
        lat:
          restaurantForm.lat === ""
            ? null
            : Number(Number(restaurantForm.lat).toFixed(6)),
        lng:
          restaurantForm.lng === ""
            ? null
            : Number(Number(restaurantForm.lng).toFixed(6)),
      };

      const data = await updateOwnerRestaurant(payload);

      setRestaurant(data);
      fillRestaurantForm(data);
      setEditingRestaurant(false);
      setRestaurantSuccess("Restoran ma'lumotlari muvaffaqiyatli yangilandi");
    } catch (error) {
      setRestaurantError(error.message || "Restoranni yangilab bo'lmadi");
    } finally {
      setSavingRestaurant(false);
    }
  }

  async function handleVariantSearch() {
    if (!variantQuery.trim()) {
      setVariantResults([]);
      return;
    }

    setVariantLoading(true);
    setPriceMessage("");

    try {
      const data = await searchVariants(variantQuery.trim());
      setVariantResults(normalizeVariantRows(data));
    } catch {
      setVariantResults([]);
    } finally {
      setVariantLoading(false);
    }
  }

  function handleVariantKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleVariantSearch();
    }
  }

  function handleGetCurrentLocation() {
    if (!navigator.geolocation) {
      setRestaurantError("Brauzer geolocation'ni qo‘llab-quvvatlamaydi");
      return;
    }

    setRestaurantError("");
    setRestaurantSuccess("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude).toFixed(6);
        const lng = Number(position.coords.longitude).toFixed(6);

        setRestaurantForm((prev) => ({
          ...prev,
          lat,
          lng,
        }));

        setRestaurantSuccess("Joylashuvingiz muvaffaqiyatli olindi");
      },
      () => {
        setRestaurantError("Joylashuvni olib bo‘lmadi. Ruxsat berilganini tekshiring.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  function handleSelectVariant(variant) {
    setSelectedVariant(variant);
    setPriceAmount("");
    setPriceMessage("");
  }

  async function handleSavePrice(e) {
    e.preventDefault();

    if (!restaurant) {
      setPriceMessageType("error");
      setPriceMessage("Avval restoran yarating");
      return;
    }

    if (!selectedVariant) {
      setPriceMessageType("error");
      setPriceMessage("Avval variant tanlang");
      return;
    }

    if (!priceAmount || Number(priceAmount) < 0) {
      setPriceMessageType("error");
      setPriceMessage("Narxni to'g'ri kiriting");
      return;
    }

    setSavingPrice(true);
    setPriceMessage("");

    try {
      await upsertOwnerPrice({
        variant_id: selectedVariant.id,
        price_amount: Number(priceAmount),
        source_type: "owner",
        is_verified: true,
      });

      setPriceMessageType("success");
      setPriceMessage("Narx muvaffaqiyatli saqlandi");
      setPriceAmount("");
      await loadOwnerPrices();
    } catch (error) {
      setPriceMessageType("error");
      setPriceMessage(error.message || "Narxni saqlashda xatolik");
    } finally {
      setSavingPrice(false);
    }
  }

  const deleteOwnerPrice = async (priceId) => {
    return await apiFetch(`/api/owner/prices/${priceId}/`, {
      method: "DELETE",
      auth: true,
    });
  };

  const handleDeleteClick = (price) => {
    setPriceToDelete(price);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!priceToDelete) return;

    setDeletingPrice(true);
    try {
      await deleteOwnerPrice(priceToDelete.id);
      setPriceMessageType("success");
      setPriceMessage("Narx muvaffaqiyatli o'chirildi");
      await loadOwnerPrices();
      setTimeout(() => setPriceMessage(""), 3000);
    } catch (error) {
      setPriceMessageType("error");
      setPriceMessage(error.message || "Narxni o'chirishda xatolik");
    } finally {
      setDeletingPrice(false);
      setShowDeleteModal(false);
      setPriceToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPriceToDelete(null);
  };

  const isOwner = user?.role === "owner" || user === null;

  const selectedVariantTitle = useMemo(() => {
    if (!selectedVariant) return "";
    return `${selectedVariant.item_name} — ${selectedVariant.label} (${selectedVariant.size_value} ${selectedVariant.size_unit})`;
  }, [selectedVariant]);

  if (restaurantLoading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,600&family=DM+Mono:wght@300;400&family=Jost:wght@300;400;500;600&display=swap');
        `}</style>
        <div className="fv-root">
          <div className="fv-bg-grid" />
          <div className="fv-bg-orb-1" />
          <div className="fv-bg-orb-2" />
          <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="fv-card-gold fv-corners" style={{ padding: "40px 60px", textAlign: "center" }}>
              <div className="fcc-bl" /><div className="fcc-br" />
              <div style={{ fontSize: 48, marginBottom: 20 }}>🍃</div>
              <h2 className="fv-display" style={{ fontSize: 28, color: "var(--np-ivory)", marginBottom: 12 }}>
                Owner dashboard yuklanmoqda
              </h2>
              <p style={{ color: "var(--np-ivory-mute)", fontSize: 14 }}>
                Restoran va narxlar ma'lumotlari tekshirilmoqda...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (user && !isOwner) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,600&family=DM+Mono:wght@300;400&family=Jost:wght@300;400;500;600&display=swap');
        `}</style>
        <div className="fv-root">
          <div className="fv-bg-grid" />
          <div className="fv-bg-orb-1" />
          <div className="fv-bg-orb-2" />
          <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="fv-card-gold fv-corners" style={{ padding: "40px 60px", textAlign: "center", maxWidth: 500 }}>
              <div className="fcc-bl" /><div className="fcc-br" />
              <div style={{ fontSize: 60, marginBottom: 20 }}>⛔</div>
              <h1 className="fv-display" style={{ fontSize: 32, color: "var(--np-ivory)", marginBottom: 16 }}>
                Ruxsat yo‘q
              </h1>
              <p style={{ color: "var(--np-ivory-mute)", fontSize: 14, marginBottom: 32 }}>
                Bu sahifa faqat owner foydalanuvchilar uchun.
              </p>
              <Link
                href="/compare"
                className="fv-action"
                style={{ display: "inline-flex", padding: "12px 28px", textDecoration: "none" }}
              >
                Solishtirish sahifasiga o‘tish
              </Link>
            </div>
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

        .fv-bg-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(201,168,76,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.022) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .fv-bg-orb-1 { position:fixed; top:-20%; right:-15%; width:55vw; height:55vw; border-radius:50%; background:radial-gradient(circle,rgba(45,106,79,0.07) 0%,transparent 65%); pointer-events:none; z-index:0; }
        .fv-bg-orb-2 { position:fixed; bottom:5%; left:-20%; width:42vw; height:42vw; border-radius:50%; background:radial-gradient(circle,rgba(201,168,76,0.05) 0%,transparent 65%); pointer-events:none; z-index:0; }

        .fv-display { font-family:'Cormorant Garamond',Georgia,serif; font-weight:600; letter-spacing:-0.01em; }
        .fv-mono    { font-family:'DM Mono',monospace; font-weight:300; letter-spacing:0.14em; text-transform:uppercase; }

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

        .fv-corners::before, .fv-corners::after,
        .fv-corners > .fcc-bl, .fv-corners > .fcc-br {
          content:''; position:absolute; width:16px; height:16px; pointer-events:none;
        }
        .fv-corners::before { top:10px; left:10px;   border-top:1px solid var(--np-border-gold); border-left:1px solid var(--np-border-gold); }
        .fv-corners::after  { top:10px; right:10px;  border-top:1px solid var(--np-border-gold); border-right:1px solid var(--np-border-gold); }
        .fv-corners > .fcc-bl { bottom:10px; left:10px;  border-bottom:1px solid var(--np-border-gold); border-left:1px solid var(--np-border-gold); }
        .fv-corners > .fcc-br { bottom:10px; right:10px; border-bottom:1px solid var(--np-border-gold); border-right:1px solid var(--np-border-gold); }

        .fv-ornament { display:flex; align-items:center; gap:10px; margin-bottom:0; }
        .fv-ornament::before,.fv-ornament::after { content:''; display:block; height:1px; width:28px; }
        .fv-ornament::before { background:linear-gradient(90deg,transparent,var(--np-gold)); }
        .fv-ornament::after  { background:linear-gradient(90deg,var(--np-gold),transparent); }
        .fv-ornament span { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:var(--np-gold); opacity:0.7; }

        .fv-badge {
          display:inline-flex; align-items:center; gap:5px;
          border-radius:1px; padding:4px 11px;
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase;
        }
        .fv-badge-em   { background:rgba(82,183,136,0.1); border:1px solid rgba(82,183,136,0.25); color:var(--np-em-bright); }
        .fv-badge-gold { background:var(--np-gold-pale); border:1px solid rgba(201,168,76,0.25); color:var(--np-gold-lt); }
        .fv-badge-gray { background:rgba(255,255,255,0.04); border:1px solid var(--np-border-ash); color:var(--np-ivory-mute); }
        .fv-badge-blue { background:rgba(96,165,250,0.08); border:1px solid rgba(96,165,250,0.2); color:#93c5fd; }

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

        .fv-action {
          width: 36px; height: 36px; border-radius: 1px;
          display: inline-flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.03); border: 1px solid var(--np-border-ash);
          cursor: pointer; transition: all 0.22s; color: var(--np-ivory-mute);
          text-decoration: none;
        }
        .fv-action:hover { border-color: var(--np-border-gold); color: var(--np-gold-lt); background: var(--np-gold-pale); }
        .fv-action-primary {
          background: linear-gradient(135deg, var(--np-emerald), #1b4332);
          border: 1px solid rgba(82,183,136,0.3);
          color: var(--np-ivory);
          padding: 10px 24px;
          width: auto;
          gap: 8px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .fv-action-primary:hover { background: linear-gradient(135deg, #1b4332, #0f2c1f); color: var(--np-ivory); border-color: rgba(82,183,136,0.5); }

        .fv-input {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--np-border-ash);
          border-radius: 1px;
          padding: 12px 16px;
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          color: var(--np-ivory-dim);
          outline: none;
          transition: border-color 0.22s;
          width: 100%;
        }
        .fv-input:focus { border-color: var(--np-border-gold); }
        .fv-input::placeholder { color: var(--np-ivory-mute); }

        .fv-textarea {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--np-border-ash);
          border-radius: 1px;
          padding: 12px 16px;
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          color: var(--np-ivory-dim);
          outline: none;
          transition: border-color 0.22s;
          width: 100%;
          resize: vertical;
        }
        .fv-textarea:focus { border-color: var(--np-border-gold); }

        .fv-label {
          display: block;
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--np-ivory-mute);
          margin-bottom: 8px;
        }

        .fv-row {
          padding: 20px 24px;
          border-bottom: 1px solid var(--np-border-ash);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          transition: background 0.2s;
          position: relative;
        }
        .fv-row:last-child { border-bottom: none; }
        .fv-row:hover { background: rgba(201,168,76,0.025); }

        .fv-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.1em;
          color: var(--np-ivory-mute); background: rgba(255,255,255,0.03);
          border: 1px solid var(--np-border-ash); border-radius: 1px; padding: 3px 10px;
        }

        .fv-empty { padding: 48px 24px; text-align: center; }

        .fv-modal-overlay {
          position: fixed; inset: 0; z-index: 50;
          display: flex; align-items: center; justify-content: center; padding: 16px;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
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
          background: linear-gradient(90deg,transparent,var(--np-crimson-lt) 40%,var(--np-gold) 70%,transparent);
        }
        .fv-modal-btn {
          flex: 1; padding: 10px 20px; border-radius: 1px; cursor: pointer;
          font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
          transition: all 0.22s;
        }
        .fv-modal-btn.cancel {
          background: rgba(255,255,255,0.03); border: 1px solid var(--np-border-ash); color: var(--np-ivory-mute);
        }
        .fv-modal-btn.cancel:hover { border-color: var(--np-border-gold); color: var(--np-ivory-dim); }
        .fv-modal-btn.confirm {
          background: rgba(192,57,43,0.15); border: 1px solid rgba(192,57,43,0.35); color: #f87171;
        }
        .fv-modal-btn.confirm:hover { background: rgba(192,57,43,0.25); border-color: rgba(248,113,113,0.5); }

        .fv-variant-item {
          padding: 16px 20px;
          border-bottom: 1px solid var(--np-border-ash);
          cursor: pointer;
          transition: all 0.2s;
        }
        .fv-variant-item:hover { background: rgba(201,168,76,0.05); }
        .fv-variant-item.selected { background: rgba(82,183,136,0.08); border-left: 2px solid var(--np-em-bright); }

        @keyframes fv-fade-in  { from{opacity:0;} to{opacity:1;} }
        @keyframes fv-scale-in { from{opacity:0;transform:scale(0.96);} to{opacity:1;transform:none;} }
        @keyframes fv-fade-up  { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:none;} }
        .fv-fade-up { animation:fv-fade-up 0.5s cubic-bezier(.16,1,.3,1) both; }
        .fv-fade-up-1 { animation-delay:0.05s; }
        .fv-fade-up-2 { animation-delay:0.12s; }
        .fv-fade-up-3 { animation-delay:0.18s; }
      `}</style>

      <div className="fv-root">
        <div className="fv-bg-grid" />
        <div className="fv-bg-orb-1" />
        <div className="fv-bg-orb-2" />

        <div style={{ position: "relative", zIndex: 1 }}>
          <NavBar />

          <main style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>

            {/* Header Section */}
            <div className="fv-card-gold fv-corners fv-fade-up" style={{ padding: "40px 44px", marginBottom: 20 }}>
              <div className="fcc-bl" /><div className="fcc-br" />
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
                <div>
                  <div className="fv-badge fv-badge-gold" style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 12 }}>✦</span>
                    Owner Panel
                  </div>
                  <h1 className="fv-display" style={{ fontSize: "clamp(28px,4vw,48px)", color: "var(--np-ivory)", marginBottom: 10 }}>
                    Restoran{" "}
                    <em style={{ fontStyle: "italic", fontWeight: 300, color: "var(--np-gold-lt)" }}>boshqaruvi</em>
                  </h1>
                  <p style={{ color: "var(--np-ivory-mute)", fontSize: 14, lineHeight: 1.7, maxWidth: 500 }}>
                    Restoran ma'lumotlarini boshqaring va mahsulotlar uchun narxlarni yangilang
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 20 }}>
              {/* Stat Cards */}
              <div className="fv-stat fv-fade-up fv-fade-up-1">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span className="fv-mono" style={{ fontSize: 9, color: "var(--np-ivory-mute)" }}>Restoran holati</span>
                  <span style={{ fontSize: 18 }}>🏪</span>
                </div>
                <div className="fv-display" style={{ fontSize: 32, color: restaurant ? "var(--np-em-bright)" : "var(--np-ivory-mute)", lineHeight: 1 }}>
                  {restaurant ? restaurant.name : "Yaratilmagan"}
                </div>
              </div>
              <div className="fv-stat fv-fade-up fv-fade-up-2">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span className="fv-mono" style={{ fontSize: 9, color: "var(--np-ivory-mute)" }}>Mening narxlarim</span>
                  <span style={{ fontSize: 18 }}>💰</span>
                </div>
                <div className="fv-display" style={{ fontSize: 42, color: "var(--np-gold-lt)", lineHeight: 1 }}>{prices.length}</div>
              </div>
            </div>

            {/* Main Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
              {/* Left Column */}
              <div className="space-y-6">
                {/* Restaurant Card */}
                <div className="fv-card-gold fv-fade-up fv-fade-up-1" style={{ overflow: "hidden" }}>
                  <div style={{ borderBottom: "1px solid var(--np-border-ash)", padding: "20px 28px" }}>
                    <div className="fv-ornament" style={{ marginBottom: 0 }}>
                      <span>Restoran ma'lumotlari</span>
                    </div>
                  </div>

                  <div style={{ padding: "28px" }}>
                    {restaurantError && (
                      <div style={{ marginBottom: 20, padding: "12px 16px", background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.25)", borderRadius: 1, color: "#f87171", fontSize: 13 }}>
                        {restaurantError}
                      </div>
                    )}

                    {restaurantSuccess && (
                      <div style={{ marginBottom: 20, padding: "12px 16px", background: "rgba(82,183,136,0.1)", border: "1px solid rgba(82,183,136,0.25)", borderRadius: 1, color: "var(--np-em-bright)", fontSize: 13 }}>
                        {restaurantSuccess}
                      </div>
                    )}

                    {!restaurant ? (
                      <form onSubmit={handleCreateRestaurant}>
                        <RestaurantFieldsForm
                          form={restaurantForm}
                          onChange={handleRestaurantChange}
                          onGetLocation={handleGetCurrentLocation}
                        />
                        <div style={{ marginTop: 24 }}>
                          <button
                            type="submit"
                            disabled={savingRestaurant}
                            className="fv-action fv-action-primary"
                            style={{ width: "auto" }}
                          >
                            {savingRestaurant ? "Saqlanmoqda..." : "Restoran yaratish"}
                          </button>
                        </div>
                      </form>
                    ) : editingRestaurant ? (
                      <form onSubmit={handleUpdateRestaurant}>
                        <RestaurantFieldsForm
                          form={restaurantForm}
                          onChange={handleRestaurantChange}
                          onGetLocation={handleGetCurrentLocation}
                        />
                        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                          <button
                            type="submit"
                            disabled={savingRestaurant}
                            className="fv-action fv-action-primary"
                            style={{ width: "auto" }}
                          >
                            {savingRestaurant ? "Yangilanmoqda..." : "Saqlash"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRestaurant(false);
                              fillRestaurantForm(restaurant);
                              setRestaurantError("");
                              setRestaurantSuccess("");
                            }}
                            className="fv-action"
                            style={{ width: "auto", padding: "10px 24px" }}
                          >
                            Bekor qilish
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRestaurant(true);
                              setRestaurantError("");
                              setRestaurantSuccess("");
                            }}
                            className="fv-action"
                            style={{ width: "auto", padding: "8px 20px", fontSize: 10 }}
                          >
                            Tahrirlash
                          </button>
                        </div>
                        <div style={{ display: "grid", gap: 16 }}>
                          <RestaurantInfoRow icon="🏷️" label="Restoran nomi" value={restaurant.name} />
                          <RestaurantInfoRow icon="📍" label="Manzil" value={restaurant.address_text || "—"} />
                          <RestaurantInfoRow icon="📞" label="Telefon" value={restaurant.phone || "—"} />
                          <RestaurantInfoRow icon="🔗" label="Slug" value={restaurant.slug} />
                          {restaurant.lat && restaurant.lng && (
                            <RestaurantInfoRow icon="🗺️" label="Koordinatalar" value={`${restaurant.lat}, ${restaurant.lng}`} />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Price Entry Card */}
                <div className="fv-card-gold fv-fade-up fv-fade-up-2" style={{ overflow: "hidden" }}>
                  <div style={{ borderBottom: "1px solid var(--np-border-ash)", padding: "20px 28px" }}>
                    <div className="fv-ornament" style={{ marginBottom: 0 }}>
                      <span>Narx qo‘shish</span>
                    </div>
                  </div>

                  <div style={{ padding: "28px" }}>
                    {!restaurant ? (
                      <div style={{ padding: "24px", textAlign: "center", background: "rgba(201,168,76,0.05)", border: "1px solid var(--np-border-gold)" }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
                        <p style={{ color: "var(--np-ivory-dim)", fontSize: 14, marginBottom: 8 }}>Avval restoran yarating</p>
                        <p className="fv-mono" style={{ fontSize: 10, color: "var(--np-ivory-mute)" }}>Restoran ma'lumotlarini kiritgandan so'ng narx qo'sha olasiz</p>
                      </div>
                    ) : (
                      <>
                        {/* Search */}
                        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                          <div style={{ flex: 1, position: "relative" }}>
                            <input
                              type="text"
                              value={variantQuery}
                              onChange={(e) => setVariantQuery(e.target.value)}
                              onKeyDown={handleVariantKeyDown}
                              placeholder="Masalan: cappuccino, lavash, burger..."
                              className="fv-input"
                              style={{ paddingLeft: 36 }}
                            />
                            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--np-ivory-mute)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <button
                            type="button"
                            onClick={handleVariantSearch}
                            disabled={variantLoading}
                            className="fv-action"
                            style={{ width: "auto", padding: "0 20px" }}
                          >
                            {variantLoading ? "..." : "Qidirish"}
                          </button>
                        </div>

                        {/* Results */}
                        {variantResults.length > 0 && (
                          <div style={{ marginBottom: 24, border: "1px solid var(--np-border-ash)", borderRadius: 1, maxHeight: 320, overflowY: "auto" }}>
                            {variantResults.map((variant) => (
                              <div
                                key={variant.id}
                                onClick={() => handleSelectVariant(variant)}
                                className={`fv-variant-item ${selectedVariant?.id === variant.id ? "selected" : ""}`}
                              >
                                <div style={{ fontWeight: 500, color: "var(--np-ivory)", marginBottom: 6 }}>{variant.item_name}</div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                  <span className="fv-pill">{variant.category_name}</span>
                                  <span className="fv-pill">{variant.size_value} {variant.size_unit}</span>
                                  <span className="fv-pill">{variant.label}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {variantQuery.trim() && !variantLoading && variantResults.length === 0 && (
                          <div style={{ padding: "32px", textAlign: "center", border: "1px solid var(--np-border-ash)", borderRadius: 1, marginBottom: 24 }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                            <p style={{ color: "var(--np-ivory-dim)" }}>Hech narsa topilmadi</p>
                          </div>
                        )}

                        {/* Price Form */}
                        {selectedVariant && (
                          <form onSubmit={handleSavePrice} style={{ marginTop: 20 }}>
                            <div style={{ marginBottom: 16 }}>
                              <label className="fv-label">Tanlangan variant</label>
                              <div style={{ padding: "12px 16px", background: "rgba(82,183,136,0.08)", border: "1px solid rgba(82,183,136,0.25)", borderRadius: 1 }}>
                                <div style={{ fontWeight: 500, color: "var(--np-em-bright)", marginBottom: 4 }}>{selectedVariant.item_name}</div>
                                <div style={{ fontSize: 12, color: "var(--np-ivory-mute)" }}>{selectedVariant.label} • {selectedVariant.size_value} {selectedVariant.size_unit}</div>
                              </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                              <label className="fv-label">Narx (so‘m)</label>
                              <input
                                type="number"
                                min="0"
                                step="100"
                                value={priceAmount}
                                onChange={(e) => setPriceAmount(e.target.value)}
                                placeholder="Masalan: 25000"
                                className="fv-input"
                              />
                            </div>

                            {priceMessage && (
                              <div style={{ marginBottom: 16, padding: "10px 12px", background: priceMessageType === "error" ? "rgba(192,57,43,0.1)" : "rgba(82,183,136,0.1)", border: `1px solid ${priceMessageType === "error" ? "rgba(192,57,43,0.25)" : "rgba(82,183,136,0.25)"}`, borderRadius: 1, fontSize: 12 }}>
                                {priceMessage}
                              </div>
                            )}

                            <button
                              type="submit"
                              disabled={savingPrice}
                              className="fv-action fv-action-primary"
                              style={{ width: "100%" }}
                            >
                              {savingPrice ? "Saqlanmoqda..." : "Narxni saqlash"}
                            </button>
                          </form>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - My Prices */}
              <aside>
                <div className="fv-card-gold fv-fade-up fv-fade-up-3" style={{ overflow: "hidden", position: "sticky", top: 24 }}>
                  <div style={{ borderBottom: "1px solid var(--np-border-ash)", padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div className="fv-ornament" style={{ marginBottom: 0 }}>
                      <span>Mening narxlarim</span>
                    </div>
                    <button
                      type="button"
                      onClick={loadOwnerPrices}
                      className="fv-action"
                      style={{ width: 32, height: 32 }}
                      title="Yangilash"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>

                  <div style={{ padding: "20px", maxHeight: 600, overflowY: "auto" }}>
                    {pricesLoading ? (
                      <div className="fv-empty" style={{ padding: "40px 20px" }}>
                        <div className="fv-mono" style={{ fontSize: 10 }}>Yuklanmoqda...</div>
                      </div>
                    ) : prices.length === 0 ? (
                      <div className="fv-empty">
                        <div style={{ fontSize: 32, marginBottom: 12 }}>💰</div>
                        <p style={{ color: "var(--np-ivory-dim)", marginBottom: 8 }}>Hozircha narxlar mavjud emas</p>
                        <p className="fv-mono" style={{ fontSize: 9, color: "var(--np-ivory-mute)" }}>Yuqoridan variant tanlab narx qo'shing</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {prices.map((price, idx) => (
                          <div key={price.id || idx} className="fv-row" style={{ padding: "16px", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", width: "100%" }}>
                              <div>
                                <div className="fv-display" style={{ fontSize: 18, color: "var(--np-gold-lt)" }}>
                                  {formatNumber(price.price_amount)} so‘m
                                </div>
                                <div style={{ fontWeight: 500, marginTop: 6, color: "var(--np-ivory)" }}>
                                  {price.item_name || "Noma’lum"}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteClick(price)}
                                className="fv-action"
                                style={{ width: 32, height: 32, background: "rgba(192,57,43,0.1)", borderColor: "rgba(192,57,43,0.3)" }}
                                title="O'chirish"
                              >
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {price.category_name && <span className="fv-pill" style={{ fontSize: 9 }}>{price.category_name}</span>}
                              {price.variant_label && <span className="fv-pill" style={{ fontSize: 9 }}>{price.variant_label}</span>}
                              {price.size_value && <span className="fv-pill" style={{ fontSize: 9 }}>{price.size_value} {price.size_unit}</span>}
                            </div>
                            <div style={{ fontSize: 9, color: "var(--np-ivory-mute)", fontFamily: "'DM Mono', monospace" }}>
                              {price.created_at ? new Date(price.created_at).toLocaleDateString("uz-UZ") : "yangi"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && priceToDelete && (
        <div className="fv-modal-overlay">
          <div className="fv-modal fv-corners">
            <div className="fcc-bl" /><div className="fcc-br" />
            <div style={{ width: 52, height: 52, borderRadius: 2, margin: "0 auto 24px", background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" fill="none" stroke="#f87171" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="fv-display" style={{ fontSize: 26, color: "var(--np-ivory)", textAlign: "center", marginBottom: 12 }}>
              Narxni o'chirish
            </h3>
            <p style={{ color: "var(--np-ivory-mute)", fontSize: 13, textAlign: "center", lineHeight: 1.7, marginBottom: 32 }}>
              <strong>{priceToDelete.item_name || "Mahsulot"}</strong> narxini o'chirmoqchimisiz?
              <br />
              <span style={{ color: "var(--np-gold-lt)" }}>{formatNumber(priceToDelete.price_amount)} so‘m</span>
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="fv-modal-btn cancel" onClick={cancelDelete} disabled={deletingPrice}>
                Bekor qilish
              </button>
              <button className="fv-modal-btn confirm" onClick={confirmDelete} disabled={deletingPrice}>
                {deletingPrice ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Subcomponents
function RestaurantFieldsForm({ form, onChange, onGetLocation }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <label className="fv-label">Restoran nomi *</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Masalan: Rayhon Coffee"
          className="fv-input"
          required
        />
      </div>
      <div>
        <label className="fv-label">Slug *</label>
        <input
          type="text"
          name="slug"
          value={form.slug}
          onChange={onChange}
          placeholder="rayhon-coffee"
          className="fv-input"
          required
        />
      </div>
      <div>
        <label className="fv-label">Telefon</label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={onChange}
          placeholder="+998 90 123 45 67"
          className="fv-input"
        />
      </div>
      <div>
        <label className="fv-label">Do'kon manzili</label>
        <textarea
          name="address_text"
          value={form.address_text}
          onChange={onChange}
          rows={3}
          placeholder="Masalan: Farg‘ona shahri, Alisher Navoiy ko‘chasi, 25-uy"
          className="fv-textarea"
        />
      </div>
      <div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={onGetLocation}
            className="fv-action"
            style={{ width: "auto", padding: "10px 20px" }}
          >
            Joylashuvni olish
          </button>
          {form.lat && form.lng && (
            <div className="fv-pill" style={{ fontSize: 10 }}>
              🗺️ {form.lat}, {form.lng}
            </div>
          )}
        </div>
      </div>
      <input type="hidden" name="lat" value={form.lat} readOnly />
      <input type="hidden" name="lng" value={form.lng} readOnly />
    </div>
  );
}

function RestaurantInfoRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--np-border-ash)" }}>
      <div style={{ fontSize: 20, minWidth: 32 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div className="fv-mono" style={{ fontSize: 9, color: "var(--np-ivory-mute)", marginBottom: 4 }}>{label}</div>
        <div style={{ color: "var(--np-ivory-dim)", wordBreak: "break-word" }}>{value}</div>
      </div>
    </div>
  );
}