import { Link, Navigate, useParams } from "react-router-dom";
import LegalLayout, { PolicySections } from "@/components/legal/LegalLayout";
import { getPolicyBySlug, LEGAL_POLICIES } from "@/content/legal/policies";

export default function LegalPolicy() {
  const { slug } = useParams();
  const policy = getPolicyBySlug(slug);

  if (!policy) {
    return <Navigate to="/legal" replace />;
  }

  return (
    <LegalLayout
      title={policy.label}
      lastUpdated={policy.lastUpdated}
      currentSlug={policy.slug}
    >
      <PolicySections sections={policy.sections} />

      <div className="mt-10 pt-8 border-t border-gray-200">
        <p className="text-xs font-medium uppercase tracking-widest text-[#1D9E75] mb-3">
          Other policies
        </p>
        <div className="flex flex-wrap gap-2">
          {LEGAL_POLICIES.filter((p) => p.slug !== policy.slug).map(({ slug: s, label }) => (
            <Link
              key={s}
              to={`/legal/${s}`}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-[#1D9E75] hover:text-[#1D9E75] transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </LegalLayout>
  );
}
