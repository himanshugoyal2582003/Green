'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

/**
 * Fetches listings from the backend, debounced by 120 ms.
 * Reacts to filter changes automatically.
 */
export function useListings({ category, search, condition, minPrice, maxPrice }) {
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ status: 'available' });
      if (category) params.set('category', category);
      if (search) params.set('q', search);
      if (condition) params.set('condition', condition);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);

      try {
        const data = await api(`/api/listings?${params}`, {
          signal: controller.signal,
        });
        setListings(data.listings);
        setTotal(data.total);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Marketplace is waking up — please refresh in a moment.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 120);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [category, search, condition, minPrice, maxPrice]);

  function prependListing(listing) {
    setListings((prev) => [listing, ...prev]);
    setTotal((prev) => prev + 1);
  }

  return { listings, total, loading, error, prependListing };
}
