// Renders a schema.org JSON-LD <script>. Server-only; safe-escapes `<` so a
// stray "</script>" in event data can't break out of the tag.
export default function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
