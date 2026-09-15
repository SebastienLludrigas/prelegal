import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export function StandardTerms({ filledMarkdown }: { filledMarkdown: string }) {
  return (
    <div className="mnda-doc text-[14.5px] leading-relaxed text-ink">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <p className="text-[12.5px] font-medium text-ink-soft">
              {children}
            </p>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="underline decoration-ink-faint hover:text-accent"
              target="_blank"
              rel="noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {filledMarkdown}
      </ReactMarkdown>
    </div>
  );
}
