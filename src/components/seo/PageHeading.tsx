// Big lowercase brand heading. Text is written proper-case (so crawlers read
// real keywords); the lowercase look is purely CSS.
export default function PageHeading({
  children,
  sub,
}: {
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <header className="mb-10">
      <h1
        className="text-ink lowercase"
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 300,
          fontSize: 'clamp(40px, 6vw, 68px)',
          lineHeight: 0.98,
          letterSpacing: '-1.5px',
        }}
      >
        {children}
      </h1>
      {sub && (
        <p
          className="mt-4 text-ink/50"
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 300,
            fontSize: 18,
            lineHeight: '28px',
          }}
        >
          {sub}
        </p>
      )}
    </header>
  );
}
