export default function SectionHeading({ eyebrow, title, children, align = "left", id }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className="h-display mt-3 text-4xl md:text-5xl">{title}</h2>
      {children && <p className="mt-3 text-[15px] leading-7 text-ink-soft">{children}</p>}
    </div>
  );
}
