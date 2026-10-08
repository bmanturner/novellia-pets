import Link from "next/link";
import { Fragment, useMemo, type ReactNode } from "react";

const LINK_CLASS =
  "text-cover underline underline-offset-2 transition-colors duration-150 hover:text-cover-deep";

// Alternatives that need a closing marker simply fail to match while a
// stream is mid-token, so the raw characters stay visible until it closes.
const INLINE =
  /\*\*([^*]+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\*([^*\s](?:[^*]*[^*\s])?)\*|(?<![\w])_([^_\s](?:[^_]*[^_\s])?)_(?![\w])/g;

function renderLink(label: string, url: string, key: string): ReactNode {
  if (url.startsWith("/") && !url.startsWith("//")) {
    return (
      <Link key={key} href={url} className={LINK_CLASS}>
        {label}
      </Link>
    );
  }
  if (/^https?:\/\//i.test(url)) {
    return (
      <a
        key={key}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK_CLASS}
      >
        {label}
      </a>
    );
  }
  return label;
}

function renderInline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const match of text.matchAll(INLINE)) {
    const key = `${keyBase}-${n++}`;
    if (match.index > last) out.push(text.slice(last, match.index));
    const [, bold, linkText, url, code, em1, em2] = match;
    if (bold !== undefined) {
      out.push(
        <strong key={key} className="font-semibold">
          {renderInline(bold, key)}
        </strong>,
      );
    } else if (linkText !== undefined) {
      out.push(renderLink(linkText, url, key));
    } else if (code !== undefined) {
      out.push(code);
    } else {
      out.push(<em key={key}>{em1 ?? em2}</em>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "heading"; text: string }
  | { kind: "ul" | "ol"; items: string[] };

const BULLET = /^\s*[-*]\s+(.*)$/;
const ORDERED = /^\s*\d+\.\s+(.*)$/;
const HEADING = /^\s*#{1,3}\s+(.*)$/;

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of text.trim().split(/\n{2,}/)) {
    let list: Extract<Block, { items: string[] }> | null = null;
    let para: Extract<Block, { kind: "p" }> | null = null;
    for (const line of chunk.split("\n")) {
      const heading = HEADING.exec(line);
      const bullet = BULLET.exec(line);
      const ordered = ORDERED.exec(line);
      if (heading) {
        blocks.push({ kind: "heading", text: heading[1] });
        list = null;
        para = null;
      } else if (bullet || ordered) {
        const kind = bullet ? "ul" : "ol";
        const item = (bullet ?? ordered)![1];
        para = null;
        if (list && list.kind === kind) {
          list.items.push(item);
        } else {
          list = { kind, items: [item] };
          blocks.push(list);
        }
      } else if (para) {
        para.lines.push(line);
      } else {
        list = null;
        para = { kind: "p", lines: [line] };
        blocks.push(para);
      }
    }
  }
  return blocks.filter((block) =>
    block.kind === "p" ? block.lines.join("").trim() !== "" : true,
  );
}

export function Markdown({ text }: { text: string }) {
  const blocks = useMemo(() => parseBlocks(text), [text]);
  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const key = `b${i}`;
        switch (block.kind) {
          case "heading":
            return (
              <p key={key} className="font-semibold">
                {renderInline(block.text, key)}
              </p>
            );
          case "ul":
          case "ol": {
            const List = block.kind;
            return (
              <List
                key={key}
                className={`space-y-1 pl-5 ${block.kind === "ul" ? "list-disc" : "list-decimal"}`}
              >
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item, `${key}-${j}`)}</li>
                ))}
              </List>
            );
          }
          case "p":
            return (
              <p key={key}>
                {block.lines.map((line, j) => (
                  <Fragment key={j}>
                    {j > 0 && <br />}
                    {renderInline(line, `${key}-${j}`)}
                  </Fragment>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}
