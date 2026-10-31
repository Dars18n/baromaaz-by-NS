import Img from "../Img";
import { StarIcon, WhatsAppIcon } from "../Icons";
import { SITE } from "@/lib/site";

function Stars({ value, label }) {
  return (
    <span className="flex text-terracotta-dark" role="img" aria-label={label || `${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} width={16} height={16} filled={i <= Math.round(value)} />)}
    </span>
  );
}

// Shows only real, verified reviews from src/data/reviews.json. No reviews → no rating.
export default function Reviews({ product, reviews, rating }) {
  const waText = encodeURIComponent(`Hi Baromaaz! I'd like to review my ${product.name}. Order no: \nRating (1-5): \nMy review: \n(Photos attached)`);
  return (
    <section aria-labelledby="reviews-heading" className="container-x border-t border-ink/10 pt-14 md:pt-20">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Customer reviews</p>
          <h2 id="reviews-heading" className="h-display mt-2 text-4xl md:text-5xl">What she said</h2>
          {rating && (
            <div className="mt-3 flex items-center gap-3">
              <Stars value={rating.average} />
              <p className="text-sm text-ink-soft">{rating.average} out of 5 · based on {rating.count} verified {rating.count === 1 ? "review" : "reviews"}</p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={`${SITE.whatsappLink}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="btn-outline"><WhatsAppIcon width={18} height={18} /> Review on WhatsApp</a>
          <a href={`mailto:${SITE.email}?subject=${encodeURIComponent(`Review: ${product.name}`)}`} className="btn-outline">Review by email</a>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-10 bg-beige px-6 py-10 text-center">
          <p className="font-serif text-2xl">No reviews yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">Bought this piece? Send us your review with a photo — we verify every review against an order before publishing it here.</p>
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id} className="border border-ink/10 bg-white/50 p-6">
              <div className="flex items-center justify-between gap-3">
                <Stars value={r.rating} />
                <time className="text-xs text-ink-muted" dateTime={r.date}>{new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time>
              </div>
              {r.title && <p className="mt-3 font-serif text-xl">{r.title}</p>}
              <p className="mt-2 text-[15px] leading-7 text-ink-soft">{r.text}</p>
              {r.photos?.length > 0 && (
                <ul className="mt-4 flex gap-2">
                  {r.photos.map((ph, i) => (
                    <li key={ph} className="w-20 overflow-hidden bg-beige"><Img src={ph} alt={`Photo ${i + 1} from ${r.name}'s review of ${product.name}`} width={400} height={500} className="aspect-[4/5] w-full object-cover" /></li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-xs uppercase tracking-[0.14em] text-ink-muted">{r.name}{r.city ? `, ${r.city}` : ""}{r.size ? ` · Wore size ${r.size}` : ""} · Verified buyer</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
