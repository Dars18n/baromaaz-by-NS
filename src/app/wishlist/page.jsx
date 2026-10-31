import WishlistView from "./WishlistView";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Wishlist", description: "The Baromaaz pieces you've saved for later.", path: "/wishlist", noindex: true });

export default function WishlistPage() {
  return <WishlistView />;
}
