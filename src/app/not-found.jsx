import Link from "next/link";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="h-display mt-3 text-5xl md:text-6xl">This page has sold out</h1>
      <p className="mt-4 text-[15px] text-ink-soft">The link may be old, or the piece may have been part of a past drop.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/drop" className="btn-dark">This month&rsquo;s drop</Link><Link href="/new-in" className="btn-outline">New arrivals</Link></div>
    </div>
  );
}
