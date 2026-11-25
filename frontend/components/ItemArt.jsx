'use client';

import { escapeText } from '@/lib/utils';

/** Renders a category-appropriate visual for a listing card */
export default function ItemArt({ item }) {
  if (item.images?.length) {
    return (
      <img
        className="listing-cover"
        src={item.images[0].url}
        alt={item.item}
        loading="lazy"
      />
    );
  }

  const id = String(item.id || item._id || '1');
  const tone = id.slice(-1).charCodeAt(0) % 3;

  if (item.category === 'Books') {
    return (
      <div className={`item-illustration book-object tone-${tone}`}>
        <span>{escapeText(item.item).split(/[: ]/).slice(0, 3).join(' ').toUpperCase()}</span>
        <small>one more chapter</small>
      </div>
    );
  }

  if (item.category === 'Calculators') {
    return (
      <div className="item-illustration calc-object">
        <div className="calc-screen">123.456</div>
        <div className="calc-keys">
          {Array.from({ length: 20 }, (_, i) => <i key={i} />)}
        </div>
      </div>
    );
  }

  if (item.category === 'Cycles') {
    return (
      <div className="item-illustration cycle-object">
        <i className="cycle-frame" />
        <i className="cycle-seat" />
        <i className="cycle-handle" />
        <i className="cycle-pedal" />
      </div>
    );
  }

  if (item.category === 'Electronics') {
    return (
      <div className="item-illustration elec-object">
        <div className="elec-screen">one more day</div>
      </div>
    );
  }

  return <div className="item-illustration hostel-object" />;
}
