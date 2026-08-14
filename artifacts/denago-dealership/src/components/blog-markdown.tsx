import { Fragment } from 'react';
import { Link } from 'wouter';

/**
 * Minimal markdown renderer for blog post bodies.
 * Supports: ## / ### headings, - bullet lists, paragraphs,
 * **bold**, and [text](href) links (internal links use wouter).
 */

function renderInline(text: string, keyPrefix: string) {
  const parts: React.ReactNode[] = [];
  // Split on links and bold segments
  const regex = /\*\*\[([^\]]+)\]\(([^)]+)\)\*\*|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const linkText = match[1] ?? match[3];
    const linkHref = match[1] !== undefined ? match[2] : match[4];
    if (linkText !== undefined && linkHref !== undefined) {
      const bold = match[1] !== undefined;
      const cls = `text-primary hover:underline ${bold ? 'font-bold' : 'font-semibold'}`;
      parts.push(
        linkHref.startsWith('/') ? (
          <Link key={`${keyPrefix}-${i}`} href={linkHref} className={cls}>
            {linkText}
          </Link>
        ) : (
          <a key={`${keyPrefix}-${i}`} href={linkHref} className={cls} target="_blank" rel="noopener noreferrer">
            {linkText}
          </a>
        ),
      );
    } else if (match[5] !== undefined) {
      parts.push(<strong key={`${keyPrefix}-${i}`}>{match[5]}</strong>);
    }
    lastIndex = regex.lastIndex;
    i++;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export function BlogMarkdown({ markdown }: { markdown: string }) {
  const lines = markdown.split('\n');
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={`ul-${key++}`} className="list-disc pl-6 space-y-2 mb-6 text-foreground/85">
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInline(item, `li-${key}-${idx}`)}</li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('- ')) {
      listItems.push(line.slice(2));
      continue;
    }
    flushList();
    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${key++}`} className="text-xl lg:text-2xl font-display font-bold mt-10 mb-4 uppercase tracking-tight">
          {renderInline(line.slice(4), `h3-${key}`)}
        </h3>,
      );
    } else if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={`h2-${key++}`} className="text-2xl lg:text-3xl font-display font-bold mt-12 mb-5 uppercase tracking-tight">
          {renderInline(line.slice(3), `h2-${key}`)}
        </h2>,
      );
    } else if (line.trim().length > 0) {
      blocks.push(
        <p key={`p-${key++}`} className="text-lg leading-relaxed text-foreground/80 mb-5">
          {renderInline(line, `p-${key}`)}
        </p>,
      );
    }
  }
  flushList();
  return <Fragment>{blocks}</Fragment>;
}
