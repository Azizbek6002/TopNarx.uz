// frontend/lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

function isBrowser() {
  return typeof window !== "undefined";
}

function getStoredValue(key) {
  if (!isBrowser()) return null;
  const value = localStorage.getItem(key);
  if (!value || value === "null" || value === "undefined") return null;
  return value;
}

function setStoredValue(key, value) {
  if (!isBrowser()) return;
  localStorage.setItem(key, value);
}

function removeStoredAuth() {
  if (!isBrowser()) return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  // Dispatch authChange event after logout
  if (isBrowser()) {
    window.dispatchEvent(new Event('authChange'));
  }
}

export function getStoredUser() {
  const raw = getStoredValue("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAuthData(data) {
  if (!isBrowser()) return;

  if (data?.access) {
    setStoredValue("access_token", data.access);
  }
  if (data?.refresh) {
    setStoredValue("refresh_token", data.refresh);
  }
  if (data?.user) {
    setStoredValue("user", JSON.stringify(data.user));
  }

  // ADD THIS LINE - Dispatch authChange event after successful login/registration
  window.dispatchEvent(new Event('authChange'));
}

export function logoutAndRedirect() {
  removeStoredAuth();
  if (!isBrowser()) return;
  localStorage.removeItem("pending_restaurant_name");
  window.location.href = "/login";
}

async function parseResponse(res) {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function buildErrorMessage(res, data) {
  if (data && typeof data === "object") {
    if (typeof data.detail === "string") return data.detail;

    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const firstValue = data[firstKey];
      if (Array.isArray(firstValue) && firstValue.length) {
        return String(firstValue[0]);
      }
      if (typeof firstValue === "string") {
        return firstValue;
      }
    }
  }

  if (typeof data === "string" && data.trim()) return data;
  return `HTTP ${res.status}`;
}

function isTokenError(res, data) {
  const detail =
    (data && typeof data.detail === "string" && data.detail.toLowerCase()) || "";

  return (
    res.status === 401 ||
    detail.includes("token not valid") ||
    detail.includes("given token not valid") ||
    detail.includes("not valid for any token type")
  );
}

async function refreshAccessToken() {
  const refresh = getStoredValue("refresh_token");
  if (!refresh) {
    throw new Error("Refresh token topilmadi");
  }

  const res = await fetch(`${API_BASE}/api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  const data = await parseResponse(res);

  if (!res.ok || !data?.access) {
    throw new Error(buildErrorMessage(res, data));
  }

  setStoredValue("access_token", data.access);
  return data.access;
}

export async function apiFetch(path, options = {}, retry = true) {
  const useAuth = options.auth !== false;
  const accessToken = getStoredValue("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (useAuth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const { auth, ...fetchOptions } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  const data = await parseResponse(res);

  if (useAuth && retry && isTokenError(res, data)) {
    try {
      const newAccess = await refreshAccessToken();

      const retryHeaders = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${newAccess}`,
      };

      const retryRes = await fetch(`${API_BASE}${path}`, {
        ...fetchOptions,
        headers: retryHeaders,
      });

      const retryData = await parseResponse(retryRes);

      if (!retryRes.ok) {
        throw new Error(buildErrorMessage(retryRes, retryData));
      }

      return retryData;
    } catch (error) {
      logoutAndRedirect();
      throw new Error("Sessiya tugadi. Qaytadan login qiling.");
    }
  }

  if (!res.ok) {
    throw new Error(buildErrorMessage(res, data));
  }

  return data;
}

/* =========================
   AUTH
========================= */
export async function loginUser(payload) {
  return apiFetch("/api/auth/login/", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export async function registerUser(payload) {
  return apiFetch("/api/auth/register/", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export async function getProfile() {
  return apiFetch("/api/auth/profile/", {
    method: "GET",
  });
}

/* =========================
   MENU / PUBLIC
========================= */
export async function getCategories() {
  return apiFetch("/api/menu/categories/", {
    method: "GET",
    auth: false,
  });
}

export async function getMenuItems() {
  return apiFetch("/api/menu/items/", {
    method: "GET",
    auth: false,
  });
}

export async function getMenuItemDetail(itemId) {
  return apiFetch(`/api/menu/items/${encodeURIComponent(String(itemId))}/`, {
    method: "GET",
    auth: false,
  });
}

export async function getItemVariants(itemId) {
  return apiFetch(
    `/api/menu/items/${encodeURIComponent(String(itemId).trim())}/variants/`,
    {
      method: "GET",
      auth: false,
    }
  );
}

export async function searchVariants(q, category = "") {
  const qs = new URLSearchParams({ q: String(q || "") });
  if (category) qs.set("category", String(category));

  return apiFetch(`/api/menu/search/variants/?${qs.toString()}`, {
    method: "GET",
    auth: false,
  });
}

export async function comparePricesByVariant(variantId) {
  const qs = new URLSearchParams({
    variant: String(variantId),
  });

  return apiFetch(`/api/compare/?${qs.toString()}`, {
    method: "GET",
    auth: false,
  });
}

export async function comparePricesByItem({ item, size, unit }) {
  const qs = new URLSearchParams({
    item: String(item),
    size: String(size),
    unit: String(unit),
  });

  return apiFetch(`/api/compare2/?${qs.toString()}`, {
    method: "GET",
    auth: false,
  });
}

export async function nearbyRestaurants({ lat, lng, radius_km = 3 }) {
  const qs = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius_km: String(radius_km),
  });

  return apiFetch(`/api/nearby/restaurants/?${qs.toString()}`, {
    method: "GET",
    auth: false,
  });
}

export async function nearbyCompare({
  item,
  size,
  unit,
  lat,
  lng,
  radius_km = 3,
}) {
  const qs = new URLSearchParams({
    item: String(item),
    size: String(size),
    unit: String(unit),
    lat: String(lat),
    lng: String(lng),
    radius_km: String(radius_km),
  });

  return apiFetch(`/api/nearby/compare/?${qs.toString()}`, {
    method: "GET",
    auth: false,
  });
}

/* =========================
   OWNER
========================= */
export async function getOwnerRestaurant() {
  return apiFetch("/api/owner/me/restaurant/", {
    method: "GET",
  });
}

export async function createOwnerRestaurant(payload) {
  return apiFetch("/api/owner/me/restaurant/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateOwnerRestaurant(payload) {
  return apiFetch("/api/owner/me/restaurant/", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getOwnerPrices() {
  return apiFetch("/api/owner/prices/", {
    method: "GET",
  });
}

export async function upsertOwnerPrice(payload) {
  return apiFetch("/api/owner/prices/upsert/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* =========================
   FAVORITES
========================= */
export async function getFavoriteVariants() {
  return apiFetch("/api/favorites/", {
    method: "GET",
  });
}

export async function createFavoriteVariant(variantId) {
  return apiFetch("/api/favorites/", {
    method: "POST",
    body: JSON.stringify({ variant_id: variantId }),
  });
}

export async function deleteFavoriteVariant(variantId) {
  return apiFetch(`/api/favorites/${encodeURIComponent(String(variantId))}/`, {
    method: "DELETE",
  });
}