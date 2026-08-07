import { useState } from "react";

export const SourceLinks = ({
  links,
}: {
  links: { url: string; title: string; source?: string }[];
}) => {
  const [showAll, setShowAll] = useState(false);
  if (!links || links.length === 0) return null;

  const uniqueLinks = Array.from(new Map(links.map((l) => [l.url, l])).values());
  const milvusLinks = uniqueLinks.filter(l => l.source !== "web");
  const webLinks = uniqueLinks.filter(l => l.source === "web");
  const MAX = 4;

  const visibleMilvus = showAll ? milvusLinks : milvusLinks.slice(0, MAX);
  const visibleWeb = showAll ? webLinks : webLinks.slice(0, MAX);
  const totalCount = milvusLinks.length + webLinks.length;
  const hiddenCount = totalCount - visibleMilvus.length - visibleWeb.length;

  const LinkPill = ({ link, color }: { link: { url: string; title: string }; color: "blue" | "green" }) => (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-md transition-colors truncate max-w-[220px] ${
        color === "blue"
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40"
          : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40"
      }`}
      title={link.title || link.url}
    >
      <span className="truncate">{link.title || new URL(link.url).hostname}</span>
    </a>
  );

  return (
    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Fonti ({uniqueLinks.length})
        </span>
      </div>

      {milvusLinks.length > 0 && (
        <div className="mb-1.5">
          <span className="text-[10px] text-gray-400 ml-1">Data Search</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {visibleMilvus.map((link, i) => <LinkPill key={`db-${i}`} link={link} color="blue" />)}
          </div>
        </div>
      )}

      {webLinks.length > 0 && (
        <div className="mb-1.5">
          <span className="text-[10px] text-gray-400 ml-1">Web</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {visibleWeb.map((link, i) => <LinkPill key={`web-${i}`} link={link} color="green" />)}
          </div>
        </div>
      )}

      {totalCount > MAX * 2 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-[11px] text-blue-500 hover:text-blue-700 mt-1"
        >
          {showAll ? "Mostra meno" : `Mostra tutti (${hiddenCount} altri)`}
        </button>
      )}
    </div>
  );
};
