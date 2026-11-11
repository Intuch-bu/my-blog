import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

export function MarkdownContent({ content }: { content: string }) {
  return <Box className="article-copy markdown-content">
    <Markdown remarkPlugins={[remarkGfm]} skipHtml components={{
      h1: ({ children }) => <Typography component="h2" variant="h2">{children}</Typography>,
      h2: ({ children }) => <Typography component="h2" variant="h2">{children}</Typography>,
      h3: ({ children }) => <Typography component="h3" variant="h3">{children}</Typography>,
      p: ({ children }) => <Typography component="p">{children}</Typography>,
      a: ({ href, children, title }) => <Link href={href} title={title} underline="always">{children}</Link>,
      table: ({ children }) => <Box className="markdown-table"><table>{children}</table></Box>,
    }}>{content}</Markdown>
  </Box>;
}
