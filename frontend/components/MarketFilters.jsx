'use client';

import { CATEGORIES, CONDITIONS } from '@/lib/utils';

/**
 * Filter bar: category tabs + search/condition/price filters.
 */
export default function MarketFilters({
  total,
  loading,
  category,
  search,
  condition,
  minPrice,
  maxPrice,
  onCategory,
  onSearch,
  onCondition,
  onMinPrice,
  onMaxPrice,
  onClear,
}) {
  return (
    <>
      <div className="market-controls">
        <div className="tabs">
          {CATEGORIES.map((value, index) => (
            <button
              key={value || 'all'}
              className={`tab${category === value ? ' active' : ''}`}
              onClick={() => onCategory(value)}
            >
              {value || 'Everything'}
              {index === 0 && <span>{total}</span>}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <label className="searchbox">
            <span>⌕</span>
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              type="search"
              placeholder="A book, a cycle, a feeling…"
            />
          </label>

          <select
            value={condition}
            onChange={(e) => onCondition(e.target.value)}
            aria-label="Condition"
          >
            <option value="">Any condition</option>
            {CONDITIONS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>

          <div className="price-filter">
            <span>₹</span>
            <input
              value={minPrice}
              onChange={(e) => onMinPrice(e.target.value)}
              type="number"
              placeholder="Min"
              min="0"
              aria-label="Minimum price"
            />
            <i>—</i>
            <input
              value={maxPrice}
              onChange={(e) => onMaxPrice(e.target.value)}
              type="number"
              placeholder="Max"
              min="0"
              aria-label="Maximum price"
            />
          </div>

          <button className="button button-reset" onClick={onClear}>
            Clear
          </button>
        </div>
      </div>

      <div className="results-line">
        <span>
          {loading
            ? 'Finding your good thing…'
            : `${total} good ${total === 1 ? 'thing' : 'things'} looking for a new home`}
        </span>
        <span className="sort-label">NEWEST FIRST&nbsp; ↘</span>
      </div>
    </>
  );
}
