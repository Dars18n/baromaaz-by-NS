import { Suspense } from "react";
import AccountView from "./AccountView";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "My Account", description: "Manage your Baromaaz profile, view orders and request returns or exchanges.", path: "/account", noindex: true });

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="container-x min-h-[60vh]" />}>
      <AccountView />
    </Suspense>
  );
}
