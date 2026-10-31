import Link from "next/link";

export default function PageHeader({ eyebrow, title, intro, crumbs = [] }) {
  return (
    <div className="container-x pb-8 pt-8 md:pb-12 md:pt-14">
      {crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-5 text-xs text-ink-muted">
          <ol className="flex flex-wrap items-baseline gap-1.5">
            <li><Link href="/" className="-my-2 inline-block py-2 hover:text-ink">Home</Link></li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex gap-1.5"><span aria-hidden="true">/</span>{c.href ? <Link href={c.href} className="-my-2 inline-block py-2 hover:text-ink">{c.label}</Link> : <span aria-current="page">{c.label}</span>}</li>
            ))}
          </ol>
        </nav>
      )}
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="h-display mt-2 text-5xl md:text-7xl">{title}</h1>
      {intro && <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink-soft md:text-base">{intro}</p>}
    </div>
  );
}
