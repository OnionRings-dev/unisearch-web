import React from "react";
import { Database } from "lucide-react";
import type { Collection } from "@/types/api";

export const CollectionDropdown = ({
  filter,
  collections,
  onSelect,
  dropdownRef,
}: {
  filter: string;
  collections: Collection[];
  onSelect: (name: string) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const filteredCollections = collections.filter((collection) =>
    collection.alias.toLowerCase().includes(filter.toLowerCase()),
  );

  if (filteredCollections.length === 0 && filter) return null;

  const displayCollections = filter ? filteredCollections : collections;

  if (displayCollections.length === 0) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto"
    >
      {displayCollections.map((collection) => (
        <button
          key={collection.name}
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onSelect(collection.name);
          }}
          className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <Database className="w-4 h-4 text-[#003366]" />
          <span>{collection.alias}</span>
        </button>
      ))}
    </div>
  );
};
