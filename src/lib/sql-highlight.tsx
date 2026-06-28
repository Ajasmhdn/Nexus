import React from "react";

const SQL_KEYWORDS = new Set([
  "SELECT", "FROM", "JOIN", "WHERE", "AND", "OR", "ORDER", "BY",
  "GROUP", "ON", "AS", "CASE", "WHEN", "THEN", "ELSE", "END",
  "INSERT", "UPDATE", "DELETE", "SET", "INTO", "VALUES", "HAVING",
  "LIMIT", "OFFSET", "NOT", "NULL", "IN", "IS", "LIKE", "BETWEEN",
  "EXISTS", "DISTINCT", "LEFT", "RIGHT", "INNER", "OUTER", "FULL",
  "CROSS", "UNION", "ALL", "CREATE", "TABLE", "DROP", "ALTER",
  "INDEX", "VIEW", "WITH", "RECURSIVE", "ASC", "DESC",
]);

const SQL_FUNCTIONS = new Set([
  "COUNT", "SUM", "AVG", "MIN", "MAX", "ROUND", "EXTRACT",
  "EPOCH", "INTERVAL", "NOW", "COALESCE", "CAST", "UPPER",
  "LOWER", "TRIM", "LENGTH", "CONCAT", "SUBSTRING",
]);

export function highlightSQL(sql: string): React.ReactNode[] {
  const lines = sql.split("\n");

  return lines.map((line, lineIndex) => {
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let tokenIndex = 0;

    while (remaining.length > 0) {
      // Match leading whitespace
      const wsMatch = remaining.match(/^(\s+)/);
      if (wsMatch) {
        tokens.push(wsMatch[1]);
        remaining = remaining.slice(wsMatch[1].length);
        continue;
      }

      // Match single-line comments
      const commentMatch = remaining.match(/^(--.*)/);
      if (commentMatch) {
        tokens.push(
          <span key={`${lineIndex}-${tokenIndex++}`} className="text-gray-500 italic">
            {commentMatch[1]}
          </span>
        );
        remaining = "";
        continue;
      }

      // Match string literals
      const stringMatch = remaining.match(/^('(?:[^'\\]|\\.)*')/);
      if (stringMatch) {
        tokens.push(
          <span key={`${lineIndex}-${tokenIndex++}`} className="text-emerald-400">
            {stringMatch[1]}
          </span>
        );
        remaining = remaining.slice(stringMatch[1].length);
        continue;
      }

      // Match numbers
      const numberMatch = remaining.match(/^(\b\d+\.?\d*\b)/);
      if (numberMatch) {
        tokens.push(
          <span key={`${lineIndex}-${tokenIndex++}`} className="text-amber-400">
            {numberMatch[1]}
          </span>
        );
        remaining = remaining.slice(numberMatch[1].length);
        continue;
      }

      // Match words (identifiers, keywords, functions)
      const wordMatch = remaining.match(/^([a-zA-Z_]\w*)/);
      if (wordMatch) {
        const word = wordMatch[1];
        const upper = word.toUpperCase();

        if (SQL_KEYWORDS.has(upper)) {
          tokens.push(
            <span key={`${lineIndex}-${tokenIndex++}`} className="text-violet-400 font-semibold">
              {word}
            </span>
          );
        } else if (SQL_FUNCTIONS.has(upper)) {
          tokens.push(
            <span key={`${lineIndex}-${tokenIndex++}`} className="text-fuchsia-400">
              {word}
            </span>
          );
        } else {
          tokens.push(
            <span key={`${lineIndex}-${tokenIndex++}`} className="text-gray-300">
              {word}
            </span>
          );
        }
        remaining = remaining.slice(word.length);
        continue;
      }

      // Match operators and symbols
      const opMatch = remaining.match(/^([^\s\w']+)/);
      if (opMatch) {
        tokens.push(
          <span key={`${lineIndex}-${tokenIndex++}`} className="text-rose-400">
            {opMatch[1]}
          </span>
        );
        remaining = remaining.slice(opMatch[1].length);
        continue;
      }

      // Fallback: consume one character
      tokens.push(remaining[0]);
      remaining = remaining.slice(1);
    }

    return (
      <React.Fragment key={lineIndex}>
        {tokens}
        {lineIndex < lines.length - 1 && "\n"}
      </React.Fragment>
    );
  });
}

/**
 * Parse simple bold markdown (**text**) into React nodes.
 */
export function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-text-primary font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
