import ReactMarkdown from "react-markdown";

export function InlineMarkdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children: nodeChildren }) => (
          <p className={className}>{nodeChildren}</p>
        ),
        a: ({ children: nodeChildren, href }) => (
          <a
            href={href}
            className="underline decoration-ink-faint hover:text-accent"
            target="_blank"
            rel="noreferrer"
          >
            {nodeChildren}
          </a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
