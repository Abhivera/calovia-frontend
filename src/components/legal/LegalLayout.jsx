import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import CaloviaLogo from "@/components/Layout/CaloviaLogo";
import { LEGAL_POLICIES } from "@/content/legal/policies";
import { LEGAL_META } from "@/content/legal/company";

const BRAND = "#1D9E75";

function MobilePolicyNav({ currentSlug }) {
  const location = useLocation();
  const navigate = useNavigate();
  const value = currentSlug ? `/legal/${currentSlug}` : location.pathname;

  return (
    <div className="lg:hidden mb-6">
      <label htmlFor="legal-policy-select" className="sr-only">
        Jump to policy
      </label>
      <select
        id="legal-policy-select"
        value={value}
        onChange={(e) => navigate(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-700"
      >
        <option value="/legal">All policies</option>
        {LEGAL_POLICIES.map(({ slug, label }) => (
          <option key={slug} value={`/legal/${slug}`}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function LegalLayout({ title, lastUpdated, currentSlug, children }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200 px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <CaloviaLogo
            to="/"
            imageClassName="h-12 w-12"
            className="shrink-0 [&_span]:text-base [&_span]:font-medium"
          />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1D9E75] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 lg:py-12">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 flex-wrap">
          <Link to="/legal" className="hover:text-[#1D9E75] transition-colors">
            Legal
          </Link>
          {title && (
            <>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <span className="text-gray-600">{title}</span>
            </>
          )}
        </nav>

        <MobilePolicyNav currentSlug={currentSlug} />

        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
          <aside className="hidden lg:block">
            <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: BRAND }}>
              Policies
            </p>
            <ul className="space-y-1">
              {LEGAL_POLICIES.map(({ slug, label }) => {
                const active = slug === currentSlug;
                return (
                  <li key={slug}>
                    <Link
                      to={`/legal/${slug}`}
                      className={`block text-sm py-1.5 px-2 rounded-md transition-colors ${
                        active
                          ? "font-medium bg-[#E1F5EE] text-[#085041]"
                          : "text-gray-500 hover:text-[#1D9E75] hover:bg-gray-50"
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>

          <main className="min-w-0">
            {title && (
              <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-medium text-gray-900 mb-2">{title}</h1>
                {lastUpdated && (
                  <p className="text-sm text-gray-400">Last updated: {lastUpdated}</p>
                )}
              </header>
            )}
            {children}
          </main>
        </div>
      </div>

      <footer className="border-t border-gray-200 px-4 sm:px-8 py-6 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © 2026 {LEGAL_META.companyName}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {LEGAL_POLICIES.map(({ slug, label }) => (
              <Link
                key={slug}
                to={`/legal/${slug}`}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function BulletList({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="list-disc pl-5 space-y-2 mt-3">
      {items.map((item) => (
        <li key={item.slice(0, 48)} className="text-sm text-gray-600 leading-relaxed">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function PolicySections({ sections }) {
  return (
    <div className="space-y-10">
      {sections.map(({ title, paragraphs = [], list = [], paragraphsAfter = [] }) => (
        <section key={title}>
          <h2 className="text-lg font-medium text-gray-900 mb-3">{title}</h2>
          {paragraphs.length > 0 && (
            <div className="space-y-3">
              {paragraphs.map((text) => (
                <p key={text.slice(0, 48)} className="text-sm text-gray-600 leading-relaxed">
                  {text}
                </p>
              ))}
            </div>
          )}
          <BulletList items={list} />
          {paragraphsAfter.length > 0 && (
            <div className="space-y-3 mt-3">
              {paragraphsAfter.map((text) => (
                <p key={text.slice(0, 48)} className="text-sm text-gray-600 leading-relaxed">
                  {text}
                </p>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
