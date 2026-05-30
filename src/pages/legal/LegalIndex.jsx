import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import LegalLayout from "@/components/legal/LegalLayout";
import { LEGAL_POLICIES } from "@/content/legal/policies";
import { LEGAL_META } from "@/content/legal/company";

const BRAND = "#1D9E75";

export default function LegalIndex() {
  return (
    <LegalLayout>
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-medium text-gray-900 mb-2">Legal</h1>
        <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
          Policies and legal information for {LEGAL_META.productName} — {LEGAL_META.tagline}.
          These documents explain how we handle your data, what you agree to when using the
          service, and your rights as a user in India and elsewhere.
        </p>
      </header>

      <div className="mb-8 p-4 rounded-xl border border-[#E1F5EE] bg-[#E1F5EE]/40">
        <p className="text-sm text-[#085041] leading-relaxed">
          <strong className="font-medium">Quick summary:</strong> Calovia uses AI to estimate
          nutrition from meal photos. We use Firebase for sign-in, do not show ads, and do not
          sell your data. Pro costs ₹{LEGAL_META.proPriceInr}/month after an optional{" "}
          {LEGAL_META.proTrialMonths}-month trial. The public analyser allows{" "}
          {LEGAL_META.freeAnalyzeLimit} free analyses per day without an account.
        </p>
      </div>

      <ul className="space-y-3">
        {LEGAL_POLICIES.map(({ slug, label, summary, lastUpdated }) => (
          <li key={slug}>
            <Link
              to={`/legal/${slug}`}
              className="group flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-5 hover:border-[#1D9E75] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-gray-900 group-hover:text-[#1D9E75] transition-colors">
                  {label}
                </p>
                <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">{summary}</p>
                <p className="text-[11px] text-gray-400 mt-2">Updated {lastUpdated}</p>
              </div>
              <ChevronRight className="w-5 h-5 shrink-0 mt-0.5 text-gray-300 group-hover:text-[#1D9E75] transition-colors" />
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-sm text-gray-500 mt-8">
        Questions? Email{" "}
        <a href={`mailto:${LEGAL_META.legalEmail}`} className="font-medium hover:underline" style={{ color: BRAND }}>
          {LEGAL_META.legalEmail}
        </a>{" "}
        or{" "}
        <a href={`mailto:${LEGAL_META.supportEmail}`} className="font-medium hover:underline" style={{ color: BRAND }}>
          {LEGAL_META.supportEmail}
        </a>
      </p>
    </LegalLayout>
  );
}
