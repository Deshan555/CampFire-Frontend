import React from "react";

interface MarkdownProps {
  content: string;
}

type TableAlignment = "left" | "center" | "right";

export const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  if (!content) return null;

  // Split content into blocks by double newlines or single newlines that mark formatting blocks
  // Normal paragraphs are separated by double newlines.
  const blocks = content.split(/\n\s*\n+/);

  return (
    <div className="space-y-4 font-serif text-sm sm:text-base md:text-lg leading-relaxed text-neutral-850 dark:text-neutral-200 select-text text-justify">
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. Markdown Table
        const table = parseMarkdownTable(trimmed);
        if (table) {
          return (
            <div key={index} className="markdown-table-block">
              <table className="markdown-table">
                <thead>
                  <tr>
                    {table.headers.map((header, cellIndex) => (
                      <th key={cellIndex} style={{ textAlign: table.alignments[cellIndex] }}>
                        {renderInlineStyles(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {table.headers.map((_, cellIndex) => (
                        <td key={cellIndex} style={{ textAlign: table.alignments[cellIndex] }}>
                          {renderInlineStyles(row[cellIndex] || "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // 1. Code Block (e.g. ```javascript ... ```)
        if (trimmed.startsWith("```")) {
          const lines = trimmed.split("\n");
          const language = lines[0].replace("```", "").trim();
          const code = lines
            .slice(1, lines.length - (lines[lines.length - 1].trim() === "```" ? 1 : 0))
            .join("\n");
          return (
            <pre
              key={index}
              className="bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-xl overflow-x-auto border-[0.5px] border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-250 my-4 select-all leading-normal"
            >
              {language && (
                <span className="block text-[9px] text-neutral-400 dark:text-neutral-550 uppercase font-sans font-bold mb-2 select-none border-b-[0.5px] border-neutral-200 dark:border-neutral-850 pb-1">
                  {language}
                </span>
              )}
              <code>{code}</code>
            </pre>
          );
        }

        // 2. Headings (e.g. # Heading)
        if (trimmed.startsWith("#")) {
          const match = trimmed.match(/^(#{1,6})\s+(.+)$/);
          if (match) {
            const level = match[1].length;
            const text = match[2];
            const sizeClass =
              level === 1
                ? "text-2xl sm:text-3xl font-black font-display tracking-tight text-neutral-950 dark:text-white mt-8 mb-3"
                : level === 2
                ? "text-xl sm:text-2xl font-bold font-display tracking-tight text-neutral-900 dark:text-neutral-100 mt-6 mb-3"
                : "text-lg font-bold text-neutral-850 dark:text-neutral-200 mt-5 mb-2";
            return React.createElement(
              `h${level}`,
              { key: index, className: sizeClass },
              renderInlineStyles(text)
            );
          }
        }

        // 3. Blockquote (e.g. > Quote)
        if (trimmed.startsWith(">")) {
          const quoteLines = trimmed
            .split("\n")
            .map((l) => l.replace(/^>\s*/, ""))
            .join(" ");
          return (
            <blockquote
              key={index}
              className="border-l-2 border-violet-500 pl-4 py-1 italic text-neutral-600 dark:text-neutral-400 font-serif my-4"
            >
              {renderInlineStyles(quoteLines)}
            </blockquote>
          );
        }

        // 4. Unordered List (e.g. - item)
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const listItems = trimmed.split("\n").map((item) => item.replace(/^[-*]\s+/, ""));
          return (
            <ul
              key={index}
              className="list-disc list-inside pl-4 space-y-2 my-4 text-neutral-700 dark:text-neutral-350 font-sans text-sm sm:text-base"
            >
              {listItems.map((item, itemIdx) => (
                <li key={itemIdx}>{renderInlineStyles(item)}</li>
              ))}
            </ul>
          );
        }

        const faqItem = parseFaqItem(trimmed);
        if (faqItem) {
          return (
            <div key={index} className="markdown-faq-item">
              <h4>{renderInlineStyles(faqItem.question)}</h4>
              <p>{renderInlineStyles(faqItem.answer)}</p>
            </div>
          );
        }

        // 5. Ordered List (e.g. 1. item)
        if (/^\d+\.\s+/.test(trimmed)) {
          const listItems = trimmed.split("\n").map((item) => item.replace(/^\d+\.\s+/, ""));
          return (
            <ol
              key={index}
              className="list-decimal list-inside pl-4 space-y-2 my-4 text-neutral-700 dark:text-neutral-350 font-sans text-sm sm:text-base"
            >
              {listItems.map((item, itemIdx) => (
                <li key={itemIdx}>{renderInlineStyles(item)}</li>
              ))}
            </ol>
          );
        }

        // 6. Normal Paragraph
        return (
          <p key={index} className="leading-relaxed mb-4">
            {renderInlineStyles(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

const splitTableRow = (line: string): string[] => {
  const normalized = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return normalized.split("|").map((cell) => cell.trim());
};

const getTableAlignment = (cell: string): TableAlignment => {
  const trimmed = cell.trim();
  const startsWithColon = trimmed.startsWith(":");
  const endsWithColon = trimmed.endsWith(":");

  if (startsWithColon && endsWithColon) return "center";
  if (endsWithColon) return "right";
  return "left";
};

const isSeparatorCell = (cell: string): boolean => /^:?-{3,}:?$/.test(cell.trim());

function parseMarkdownTable(block: string):
  | { headers: string[]; alignments: TableAlignment[]; rows: string[][] }
  | null {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2 || !lines[0].includes("|") || !lines[1].includes("|")) {
    return null;
  }

  const headers = splitTableRow(lines[0]);
  const separator = splitTableRow(lines[1]);

  if (
    headers.length === 0 ||
    separator.length < headers.length ||
    !separator.slice(0, headers.length).every(isSeparatorCell)
  ) {
    return null;
  }

  const alignments = headers.map((_, index) => getTableAlignment(separator[index] || ""));
  const rows = lines
    .slice(2)
    .filter((line) => line.includes("|"))
    .map(splitTableRow);

  return { headers, alignments, rows };
}

function parseFaqItem(block: string): { question: string; answer: string } | null {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return null;

  const questionMatch = lines[0].match(/^\d+\.\s+(.+)$/);
  if (!questionMatch) return null;

  const question = questionMatch[1].trim();
  const looksLikeQuestion = question.includes("?") || /^\*\*.+\*\*$/.test(question);
  if (!looksLikeQuestion) return null;

  const answer = lines
    .slice(1)
    .map((line) => line.replace(/^\d+\.\s+/, "").trim())
    .join(" ")
    .trim();

  return answer ? { question, answer } : null;
}

// Helper function to render inline styles (Bold, Italic, Code)
function renderInlineStyles(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text.replace(/\\([*_`[\]()])/g, "$1");
  let keyIdx = 0;

  while (remaining.length > 0) {
    const linkMatch = remaining.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(^|[^*])\*(?!\*)(.+?)\*(?!\*)/);
    const codeMatch = remaining.match(/`([^`]+)`/);

    const matches = [
      { match: linkMatch, type: "link" },
      { match: boldMatch, type: "bold" },
      { match: italicMatch, type: "italic" },
      { match: codeMatch, type: "code" }
    ].filter((m) => m.match && m.match.index !== undefined);

    if (matches.length === 0) {
      parts.push(<span key={keyIdx++}>{remaining}</span>);
      break;
    }

    matches.sort((a, b) => (a.match!.index || 0) - (b.match!.index || 0));
    const earliest = matches[0];
    const matchIndex = earliest.match!.index || 0;
    const matchLength = earliest.match![0].length;

    if (matchIndex > 0) {
      parts.push(<span key={keyIdx++}>{remaining.substring(0, matchIndex)}</span>);
    }

    if (earliest.type === "link") {
      const label = earliest.match![1];
      const href = earliest.match![2];
      parts.push(
        <a
          key={keyIdx++}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="markdown-link"
        >
          {renderInlineStyles(label)}
        </a>
      );
    } else if (earliest.type === "bold") {
      const matchContent = earliest.match![1];
      parts.push(
        <strong key={keyIdx++} className="font-extrabold text-neutral-950 dark:text-white">
          {renderInlineStyles(matchContent)}
        </strong>
      );
    } else if (earliest.type === "italic") {
      const prefix = earliest.match![1] || "";
      const matchContent = earliest.match![2];
      if (prefix) {
        parts.push(<span key={keyIdx++}>{prefix}</span>);
      }
      parts.push(<em key={keyIdx++} className="italic">{renderInlineStyles(matchContent)}</em>);
    } else if (earliest.type === "code") {
      const matchContent = earliest.match![1];
      parts.push(
        <code
          key={keyIdx++}
          className="bg-neutral-50 dark:bg-neutral-900 px-1.5 py-0.5 rounded font-mono text-xs text-violet-650 dark:text-violet-400 border-[0.5px] border-neutral-200 dark:border-neutral-850"
        >
          {matchContent}
        </code>
      );
    }

    remaining = remaining.substring(matchIndex + matchLength);
  }

  return parts;
}

export default Markdown;
