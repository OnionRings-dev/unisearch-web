export const SourceLinks = ({
  links,
}: {
  links: { url: string; title: string; source?: string }[];
}) => {
  if (!links || links.length === 0) return null;

  const uniqueLinks = Array.from(
    new Map(links.map((l) => [l.url, l])).values(),
  );

  const milvusLinks = uniqueLinks.filter(l => l.source !== "web");
  const webLinks = uniqueLinks.filter(l => l.source === "web");

  return (
    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Fonti
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {milvusLinks.map((link, idx) => (
          <a
            key={`db-${idx}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group"
            title={link.url}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 opacity-60 group-hover:opacity-100"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span className="truncate max-w-[200px] md:max-w-[300px]">
              {link.title || new URL(link.url).hostname}
            </span>
          </a>
        ))}
        {webLinks.map((link, idx) => (
          <a
            key={`web-${idx}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors group"
            title={link.url}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 opacity-60 group-hover:opacity-100"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="truncate max-w-[200px] md:max-w-[300px]">
              {link.title || new URL(link.url).hostname}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};
