// frontend/lib/favorites.js
const STORAGE_KEY = "topnarx_favorites";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getFavorites() {
  if (!isBrowser()) return [];

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFavorites(items) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function isFavoriteById(id) {
  return getFavorites().some((item) => item.id === id);
}

export function toggleFavorite(item) {
  const favorites = getFavorites();
  const exists = favorites.some((fav) => fav.id === item.id);

  const updated = exists
    ? favorites.filter((fav) => fav.id !== item.id)
    : [item, ...favorites];

  saveFavorites(updated);
  return updated;
}

export function clearFavorites() {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}