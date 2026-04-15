"use client";

import React from "react";

interface GenericMasonryGridProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  className?: string;
}

export function GenericMasonryGrid<T>({
  items,
  renderItem,
  columns = { default: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = "gap-6",
  className = "w-full py-12",
}: GenericMasonryGridProps<T>) {
  if (items.length === 0) return null;

  const columnClasses = [
    `columns-${columns.default || 1}`,
    columns.sm ? `sm:columns-${columns.sm}` : "",
    columns.md ? `md:columns-${columns.md}` : "",
    columns.lg ? `lg:columns-${columns.lg}` : "",
    columns.xl ? `xl:columns-${columns.xl}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <div className={`${columnClasses} ${gap}`}>
        {items.map((item, index) => (
          <div key={index} className="break-inside-avoid mb-6">
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
