import Img from "@/components/Img";
import Reveal from "@/components/Reveal";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "About Baromaaz — Handcrafted Indian Ethnic Wear Brand",
  description: "You were never meant to be one version of yourself. Discover Baromaaz: fashion that moves with your moods, moments and energy.",
  path: "/about",
});

const storyLines = [
  "Some days, you’re soft.",
  "Some days, you want to be seen.",
  "Some days, you’re effortless.",
  "Other days, unstoppable.",
];

export default function AboutPage() {
  return (
    <>
      <section className="container-x grid items-center gap-10 pt-8 md:grid-cols-2 md:gap-16 md:pt-14">
        <div className="max-w-2xl">
          <p className="eyebrow">Our story</p>
          <h1 className="h-display mt-3 text-5xl md:text-7xl">You were never meant to be one version of yourself.</h1>
          <div className="mt-6 space-y-3 text-[16px] leading-8 text-ink-soft">
            {storyLines.map((line) => <p key={line}>{line}</p>)}
          </div>
          <p className="mt-6 text-[16px] leading-8 text-ink-soft">But fashion has always tried to define you. Put you in a box. Tell you who to be. <strong className="font-medium text-ink">We didn’t believe in that.</strong></p>
          <p className="mt-4 text-[16px] leading-8 text-ink-soft">So we created Baromaaz.</p>
          <p className="mt-4 text-[16px] leading-8 text-ink-soft">A brand that moves with you—with your moods, your moments, your energy.</p>
          <p className="mt-4 font-serif text-2xl text-terracotta-dark">Har mahina, naya libaas. Baromaaz.</p>
          <p className="mt-4 text-[16px] leading-8 text-ink-soft">Because every month brings a new mood. And every mood deserves its own expression.</p>
          <p className="mt-4 text-[16px] leading-8 text-ink-soft">From timeless Indian silhouettes to bold, modern statements, every piece is designed to reflect how you feel—not how you’re told to dress.</p>
          <p className="mt-4 text-[16px] leading-8 text-ink-soft">This is not just clothing.</p>
          <p className="mt-4 text-[16px] leading-8 text-ink-soft">It’s your soft days. Your powerful days. Your main character days.</p>
          <p className="mt-4 text-[16px] leading-8 text-ink-soft">Because you’re not one story. And you were never meant to be.</p>
        </div>
        <Reveal className="overflow-hidden rounded-t-full bg-beige">
          <Img src="/images/about/studio.webp" alt="A Baromaaz chikankari kurti photographed in the Jaipur studio" priority className="aspect-[4/5] w-full object-cover" />
        </Reveal>
      </section>

      <section aria-label="Our impact" className="container-x grid gap-8 py-20 sm:grid-cols-2 md:py-28">
        <div className="border-t border-ink/20 pt-6">
          <p className="font-serif text-5xl text-terracotta-dark">100%</p>
          <h2 className="mt-3 font-serif text-2xl">Ethically Sourced</h2>
        </div>
        <div className="border-t border-ink/20 pt-6">
          <p className="font-serif text-5xl text-terracotta-dark">50+</p>
          <h2 className="mt-3 font-serif text-2xl">Artisans Supported</h2>
        </div>
      </section>
    </>
  );
}
