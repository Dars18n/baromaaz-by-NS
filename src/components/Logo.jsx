// The BA12OMAAZ wordmark — "12" (bara, twelve months) replaces the R.
// Screen readers and search engines read it as "Baromaaz".
export default function Logo({ className = "" }) {
  return (
    <span className={`inline-flex items-baseline whitespace-nowrap leading-none ${className}`}>
      <span className="sr-only">Baromaaz</span>
      <span aria-hidden="true" className="font-logo uppercase tracking-[0.08em]">
        BA
        <span className="relative mx-[-0.06em] inline-block font-script text-[1.62em] normal-case leading-[0] tracking-[-0.12em] [top:0.04em]">12</span>
        OMAAZ
      </span>
    </span>
  );
}
