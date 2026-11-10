export default function Logo({ className = "" }) {
  return (
    <span className={`inline-flex items-center leading-none ${className}`} aria-label="Baromaaz">
      <img src="/images/baromaaz-wordmark.png" alt="Baromaaz" className="h-[1em] w-auto object-contain" />
    </span>
  );
}
