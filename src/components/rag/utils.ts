import type { PhaseData } from "@/hooks/useRagQuery";

// Funzione per convertire LaTeX semplice e Markdown in HTML
export const parseLatexToHtml = (latex: string): string => {
  if (!latex) return "";

  // 1. Line-by-line processing for Tables and ALL List types (Markdown & LaTeX)
  const lines = latex.split("\n");
  let inTable = false;
  let tableHtml = "";
  let inList = false;
  let listType: "ul" | "ol" | null = null;
  const processedLines: string[] = [];

  const closeList = () => {
    if (inList && listType) {
      processedLines.push(`</${listType}>`);
      inList = false;
      listType = null;
    }
  };

  const closeTable = () => {
    if (inTable) {
      tableHtml += "</tbody></table></div>";
      processedLines.push(tableHtml);
      inTable = false;
      tableHtml = "";
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip LaTeX list delimiters - we manage them automatically via items
    if (
      trimmed === "\\begin{itemize}" ||
      trimmed === "\\end{itemize}" ||
      trimmed === "\\begin{enumerate}" ||
      trimmed === "\\end{enumerate}"
    ) {
      continue;
    }

    // Check for Table
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      closeList();
      if (!inTable) {
        inTable = true;
        tableHtml =
          '<div class="overflow-x-auto my-4 shadow-sm border rounded-lg"><table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"><thead class="bg-gray-50 dark:bg-gray-900 border-b">';
      }
      const cells = trimmed
        .split("|")
        .filter((_, index, array) => index > 0 && index < array.length - 1);
      if (trimmed.includes("---")) {
        tableHtml = tableHtml.replace(
          "</thead>",
          '</thead><tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">',
        );
        continue;
      }
      const isHeader = !tableHtml.includes("</thead><tbody");
      tableHtml += "<tr>";
      cells.forEach((cell) => {
        const content = cell.trim();
        if (isHeader) {
          tableHtml += `<th class="px-3 py-2 text-left text-xs font-bold text-[#003366] dark:text-blue-400 uppercase tracking-wider">${content}</th>`;
        } else {
          tableHtml += `<td class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">${content}</td>`;
        }
      });
      tableHtml += "</tr>";
    }
    // Check for ANY List Item (*, -, 1., or \item)
    else if (
      trimmed.startsWith("* ") ||
      trimmed.startsWith("- ") ||
      /^\d+\.\s/.test(trimmed) ||
      trimmed.startsWith("\\item")
    ) {
      closeTable();
      const isNumbered = /^\d+\.\s/.test(trimmed);
      const currentType = isNumbered ? "ol" : "ul";

      if (!inList || listType !== currentType) {
        closeList();
        inList = true;
        listType = currentType;
        const listClass = isNumbered ? "list-decimal" : "list-disc";
        processedLines.push(
          `<${listType} class="${listClass} mb-3 space-y-1 pl-8 text-gray-700 dark:text-gray-300">`,
        );
      }

      const content = trimmed.replace(/^(\*|-|\d+\.|\\item)\s*/, "");
      processedLines.push(`<li>${content}</li>`);
    }
    // Normal line
    else {
      closeTable();
      closeList();
      processedLines.push(line);
    }
  }

  closeTable();
  closeList();

  let html = processedLines.join("\n");

  html = html
    // 1. Custom Link Formats: [PDF: url] and [LINK: url]
    .replace(/\[PDF:\s*(https?:\/\/[^\]]+)\]/gi, (_, url) => {
      return `<a href="${url}" class="inline-flex items-center gap-1 text-red-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          PDF
        </a>`;
    })
    .replace(/\[LINK:\s*(https?:\/\/[^\]]+)\]/gi, (_, url) => {
      return `<a href="${url}" class="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          LINK
        </a>`;
    })
    // Headers
    .replace(
      /\\section\{([^}]+)\}/g,
      '<h2 class="text-lg font-bold mb-2 mt-4 text-[#003366] dark:text-blue-400 border-b pb-1">$1</h2>',
    )
    .replace(
      /\\subsection\{([^}]+)\}/g,
      '<h3 class="text-md font-semibold mb-1 mt-3 text-gray-800 dark:text-gray-200">$1</h3>',
    )
    .replace(
      /\\subsubsection\{([^}]+)\}/g,
      '<h4 class="text-sm font-bold mb-1 mt-2 text-gray-700 dark:text-gray-300 italic">$1</h4>',
    )
    .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mb-3">$1</h1>')
    .replace(
      /^## (.*$)/gm,
      '<h2 class="text-lg font-bold mb-2 mt-4 text-[#003366] dark:text-blue-400 border-b pb-1">$1</h2>',
    )
    .replace(
      /^### (.*$)/gm,
      '<h3 class="text-md font-semibold mb-1 mt-3 text-gray-800 dark:text-gray-200">$1</h3>',
    )
    .replace(
      /^#### (.*$)/gm,
      '<h4 class="text-sm font-bold mb-1 mt-2 text-gray-700 dark:text-gray-300 italic">$1</h4>',
    )
    .replace(
      /^##### (.*$)/gm,
      '<h5 class="text-sm font-semibold mb-1 mt-2 text-gray-600 dark:text-gray-400">$1</h5>',
    )
    .replace(
      /^###### (.*$)/gm,
      '<h6 class="text-xs font-semibold mb-1 mt-2 text-gray-500 dark:text-gray-500">$1</h6>',
    )
    // Standard Formatting
    .replace(
      /\\href\{([^}]+)\}\{([^}]+)\}/g,
      '<a href="$1" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$2</a>',
    )
    .replace(/\\textbf\{([^}]+)\}/g, "<strong>$1</strong>")
    .replace(/\\textit\{([^}]+)\}/g, "<em>$1</em>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>',
    )
    .replace(/\n\n/g, "<br/>");

  return html;
};

export const getPhaseTitle = (phase: string) => {
  switch (phase) {
    case "query_generation":
      return "Generazione Query";
    case "database_search":
      return "Data Search";
    case "web_search":
      return "Web Search";
    case "deep_fetch":
      return "Deep Fetch + AI Selection";
    case "content_extraction":
      return "Estrazione Contenuti";
    case "final_answer_generation":
      return "Generazione Risposta";
    case "thinking":
      return "Thinking (HyDE)";
    case "streaming_start":
      return "Inizio Streaming Risposta";
    case "streaming_end":
      return "Fine Streaming";
    default:
      return phase;
  }
};

export const getReasoningText = (phase: PhaseData) => {
  if (phase.phase === "query_generation" && phase.status === "completed")
    return `Generando ${phase.count || ""} query ottimizzate...`;
  if (phase.phase === "thinking")
    return phase.evaluation_explanation || "Thinking...";
  if (phase.phase === "database_search" && phase.status === "started")
    return `Ricerca nei dati interni...`;
  if (phase.phase === "web_search" && phase.status === "started")
    return `Ricerca nel web...`;
  if (phase.phase === "web_search" && phase.status === "completed" && phase.count)
    return `Trovati ${phase.count} risultati web`;
  if (phase.phase === "deep_fetch" && phase.status === "started")
    return `Analisi e fetch pagine collegate...`;
  if (phase.phase === "deep_fetch" && phase.status === "completed")
    return `Fetch completato`;
  if (phase.phase === "iteration")
    return `Data Search (${phase.iteration || "1"})...`;
  if (phase.phase === "content_extraction" && phase.status === "completed")
    return `Estratte ${phase.pages_count} pagine`;
  if (phase.phase === "final_answer_generation" && phase.status === "started")
    return `Sintesi della risposta...`;
  return `${getPhaseTitle(phase.phase)}...`;
};
