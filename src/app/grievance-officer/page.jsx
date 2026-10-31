import PolicyPage from "@/components/PolicyPage";
import { pageMeta } from "@/lib/seo";
import { SITE, formatAddress } from "@/lib/site";

const path = "/grievance-officer";
export const metadata = pageMeta({ title: "Grievance Officer", description: "Contact details of the Baromaaz Grievance Officer, as required under the Consumer Protection (E-Commerce) Rules, 2020 and the IT Rules.", path });

export default function Page() {
  const g = SITE.legal.grievanceOfficer;
  return (
    <PolicyPage title="Grievance Officer" path={path} intro="In accordance with the Consumer Protection (E-Commerce) Rules, 2020 and the Information Technology Act, 2000 and rules made thereunder.">
      <h2>Grievance Officer details</h2>
      <dl className="mt-4 grid gap-x-8 gap-y-3 text-[15px] text-ink-soft sm:grid-cols-[180px_1fr]">
        <dt className="font-medium text-ink">Name</dt><dd>{g.name}</dd>
        <dt className="font-medium text-ink">Designation</dt><dd>{g.designation}</dd>
        <dt className="font-medium text-ink">Email</dt><dd><a href={`mailto:${g.email}`}>{g.email}</a></dd>
        <dt className="font-medium text-ink">Phone</dt><dd>{g.phone}</dd>
        <dt className="font-medium text-ink">Hours</dt><dd>{g.hours}</dd>
        <dt className="font-medium text-ink">Address</dt><dd>{SITE.legal.entity}, {formatAddress()}</dd>
      </dl>
      <h2>How to raise a grievance</h2>
      <p>Email the Grievance Officer with your name, contact number, order number (if any) and a description of the issue, with photos or documents where relevant.</p>
      <h2>Timelines</h2>
      <ul>
        <li>We will acknowledge your complaint within 48 hours of receiving it.</li>
        <li>We will resolve it within one month of receipt.</li>
      </ul>
      <p>If you are not satisfied with the resolution, you may approach the National Consumer Helpline (1915 or consumerhelpline.gov.in) or the appropriate consumer commission.</p>
    </PolicyPage>
  );
}
