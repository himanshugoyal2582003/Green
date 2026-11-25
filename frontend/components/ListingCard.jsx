'use client';

import Link from 'next/link';
import { currency } from '@/lib/utils';
import { CategoryIcon } from '@/components/Icons';
import { useSavedItems } from '@/hooks/useSavedItems';

const KIND_MAP = {
  Books: 'book',
  Cycles: 'cycle',
  Calculators: 'calculator',
  Electronics: 'electronics',
  'Hostel essentials': 'hostel',
};

export default function ListingCard({ item }) {
  const { isSaved, toggleSave } = useSavedItems();
  const id = item.id || item._id;
  const saved = isSaved(id);
  const kind = KIND_MAP[item.category] || 'book';

  return (
    <article className="listing-card">
      <div className={`card-visual visual-${kind}`}>
        <Link
          href={`/listings/${id}`}
          style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {item.images?.length ? (
            <img
              className="listing-cover"
              src={item.images[0].url}
              alt={item.item}
              loading="lazy"
            />
          ) : (
            <CategoryIcon category={item.category} size={52} />
          )}
        </Link>

        <button
          type="button"
          className={`card-heart${saved ? ' saved' : ''}`}
          aria-label={saved ? 'Remove saved item' : 'Save item'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSave(item);
          }}
        >
          {saved ? '♥' : '♡'}
        </button>
      </div>

      <Link href={`/listings/${id}`} className="card-body">
        <div className="card-top-row">
          <span className="card-cat">{item.category}</span>
          <span className="card-cond">{item.condition}</span>
        </div>

        <h3 className="card-title" title={item.item}>
          {item.item}
        </h3>

        <div className="card-price-row">
          <span className="card-price">{currency(item.price)}</span>
          {item.originalPrice && (
            <span className="card-original">{currency(item.originalPrice)}</span>
          )}
        </div>

        <div className="card-footer-meta">
          {item.age} yr{item.age === 1 ? '' : 's'} old · Campus pickup
        </div>
      </Link>
    </article>
  );
}
