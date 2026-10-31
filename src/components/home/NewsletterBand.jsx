import NewsletterForm from "../NewsletterForm";
import Reveal from "../Reveal";

export default function NewsletterBand() {
  return (
    <section aria-labelledby="nl-heading" className="container-x pt-20 md:pt-28">
      <Reveal className="bg-terracotta-dark px-6 py-14 text-center text-ivory md:px-16 md:py-20">
        <p className="text-[11px] uppercase tracking-[0.3em] text-ivory/85">The Baromaaz list</p>
        <h2 id="nl-heading" className="h-display mx-auto mt-3 max-w-2xl text-4xl md:text-6xl">10% off your first order</h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-ivory/90">Be first in line for every Monthly Drop — early access, studio stories and styling notes. No spam, ever.</p>
        <div className="mx-auto mt-8 max-w-md text-left"><NewsletterForm dark id="home-newsletter" /></div>
      </Reveal>
    </section>
  );
}
