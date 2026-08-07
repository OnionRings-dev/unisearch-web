import React from "react";
import { Database } from "lucide-react";
import { COLLECTIONS } from "./constants";

export const CollectionDropdown = ({
  filter,
  onSelect,
  dropdownRef,
}: {
  filter: string;
  onSelect: (name: string) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const filteredCollections = COLLECTIONS.filter((collection) =>
    collection.alias.toLowerCase().includes(filter.toLowerCase()),
  );

  if (filteredCollections.length === 0 && filter) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto"
    >
      {(filter ? filteredCollections : COLLECTIONS).map((collection) => (
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
