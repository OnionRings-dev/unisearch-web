import React, { useRef, useEffect } from "react";
import { Send, Square } from "lucide-react";
import { COLLECTIONS } from "./constants";
import { CollectionDropdown } from "./CollectionDropdown";

export const ChatInput = ({
  value,
  onChange,
  onSubmit,
  onStop,
  isLoading,
  selectedCollection,
  setSelectedCollection,
  showCollectionDropdown,
  setShowCollectionDropdown,
  collectionFilter,
  setCollectionFilter,
  dropdownRef,
  formRef,
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onStop: () => void;
  isLoading: boolean;
  selectedCollection: string;
  setSelectedCollection: (val: string) => void;
  showCollectionDropdown: boolean;
  setShowCollectionDropdown: (open: boolean) => void;
  collectionFilter: string;
  setCollectionFilter: (filter: string) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  formRef: React.RefObject<HTMLFormElement | null>;
  className?: string;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxHeightRem = 12;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeightPx = maxHeightRem * 16;
    const newHeight = Math.max(40, Math.min(el.scrollHeight, maxHeightPx));
    el.style.height = `${newHeight}px`;
  }, [value]);

  return (
    <>
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className={`rounded-2xl border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="p-2 md:p-4 pb-2 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val);
            const atIndex = val.lastIndexOf("@");
            if (atIndex !== -1) {
              setCollectionFilter(val.slice(atIndex + 1));
              setShowCollectionDropdown(true);
            } else {
              setCollectionFilter("");
              setShowCollectionDropdown(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
          placeholder={
            isLoading ? "Elaborazione in corso..." : "Scrivi la tua domanda..."
          }
          rows={1}
          className="w-full bg-transparent border-none outline-none resize-none text-sm min-h-[24px] placeholder:text-gray-400 dark:placeholder:text-gray-500"
          disabled={isLoading}
          style={{ height: "auto" }}
        />

        {showCollectionDropdown && (
          <CollectionDropdown
            filter={collectionFilter}
            dropdownRef={dropdownRef}
            onSelect={(name) => {
              setSelectedCollection(name);
              const atIndex = value.lastIndexOf("@");
              onChange(value.slice(0, atIndex));
              setShowCollectionDropdown(false);
              setCollectionFilter("");
            }}
          />
        )}
      </div>
      <div className="px-2 pb-2 md:px-4 md:pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCollectionDropdown(true)}
            className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Università:{" "}
            {COLLECTIONS.find((c) => c.name === selectedCollection)?.alias ||
              selectedCollection}
          </button>
        </div>
        <button
          type="button"
          onClick={isLoading ? onStop : () => formRef.current?.requestSubmit()}
          className="p-2 rounded bg-[#003366] text-white hover:bg-[#004080]"
        >
          {isLoading ? (
            <Square className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
    <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center mt-1.5 px-2">
      Le risposte sono generate automaticamente e potrebbero contenere errori. Verifica sempre le informazioni con le fonti ufficiali.
    </p>
    </>
  );
};
