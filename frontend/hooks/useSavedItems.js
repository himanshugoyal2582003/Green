'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'greenSavedItems';

/**
 * Persists saved/bookmarked items in localStorage so buyers & sellers
 * can save listings from Explore, Home, or Product Detail and view them in their dashboard.
 */
export function useSavedItems() {
  const [savedItems, setSavedItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedItems(JSON.parse(raw));
    } catch {
      setSavedItems([]);
    }
  }, []);

  function persist(next) {
    setSavedItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }

  function isSaved(id) {
    return savedItems.some((item) => (item.id || item._id) === id);
  }

  function toggleSave(item) {
    const id = item.id || item._id;
    if (!id) return;
    if (isSaved(id)) {
      persist(savedItems.filter((x) => (x.id || x._id) !== id));
    } else {
      persist([item, ...savedItems]);
    }
  }

  function removeSaved(id) {
    persist(savedItems.filter((x) => (x.id || x._id) !== id));
  }

  return { savedItems, isSaved, toggleSave, removeSaved };
}
