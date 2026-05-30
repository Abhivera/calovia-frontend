import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import MealAnalysisResult from "@/components/meal/MealAnalysisResult";
import { publicAnalyzeFood } from "@/api/images";
import HeroSection from "@/components/home/HeroSection";
import CaloviaLogo from "@/components/Layout/CaloviaLogo";
import {
  Camera,
  Footprints,
  Flame,
  BarChart3,
  Lock,
  Star,
  Check,
  X,
  Loader2,
} from "lucide-react";

const BRAND = "#1D9E75";
const MINT = "#E1F5EE";
const MINT_DARK = "#085041";

const FEATURES = [
  {
    icon: Camera,
    title: "AI meal analysis",
    desc: "Snap a photo of any meal and get calories, macros, and food items in seconds.",
  },
  {
    icon: Footprints,
    title: "Step tracking",
    desc: "Sync with Apple Health or Google Health Connect. Set goals and track your daily distance.",
  },
  {
    icon: Flame,
    title: "Activity logging",
    desc: "Log runs, yoga, cycling and more. Calories burned calculated from your body weight.",
  },
  {
    icon: BarChart3,
    title: "Progress charts",
    desc: "Weekly and monthly trends for calories, macros, weight, and steps in beautiful charts.",
  },
  {
    icon: Flame,
    title: "Streak system",
    desc: "Build a habit. Your streak grows every day you log a meal — longest streak is tracked too.",
  },
  {
    icon: Lock,
    title: "Private & secure",
    desc: "Firebase auth, image ownership, and no ads. Your data is yours — export or delete anytime.",
  },
];

const STEPS = [
  {
    n: 1,
    title: "Take a photo of your meal",
    desc: "Open Calovia, tap the camera. Point it at your plate — any angle, any lighting. Upload and let the AI do the work.",
  },
  {
    n: 2,
    title: "Get instant nutrition data",
    desc: "Within seconds you see detected food items, estimated calories, protein, carbs, fat, sugar, and steps needed to burn it off.",
  },
  {
    n: 3,
    title: "Track your day and progress",
    desc: "Your dashboard shows net calories, today's meals, step chart, streaks, and long-term trends. All in one view.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "I lost 4 kg in two months just by being aware of what I eat. The photo logging makes it so effortless.",
    initials: "PR",
    name: "Priya R.",
    city: "Mumbai",
  },
  {
    quote:
      "Finally a calorie tracker that actually works for Indian food. The AI nailed my dal and sabzi every time.",
    initials: "AK",
    name: "Arjun K.",
    city: "Bengaluru",
  },
  {
    quote:
      "The streak feature keeps me motivated. 12 days and counting — I haven't missed a meal log in two weeks.",
    initials: "SM",
    name: "Sara M.",
    city: "Delhi",
  },
];

function Pill({ children, className = "" }) {
  return (
    <span
      className={`inline-block px-3 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ background: MINT, color: MINT_DARK }}
    >
      {children}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <p
      className="text-xs font-medium uppercase tracking-widest mb-2"
      style={{ color: BRAND }}
    >
      {children}
    </p>
  );
}

function Divider() {
  return <div className="h-px bg-gray-200 mx-4 sm:mx-8 max-w-6xl lg:mx-auto" />;
}

function MealAnalyzer({ fileRef, analyzing, previewUrl, analysis, rateLimit, onReset }) {
  if (analyzing) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 flex flex-col items-center gap-3">
        {previewUrl && (
          <img src={previewUrl} alt="" className="w-40 h-40 object-cover rounded-lg" />
        )}
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND }} />
        <p className="text-sm text-gray-600">Analyzing…</p>
      </div>
    );
  }

  if (analysis) {
    return (
      <div className="space-y-4">
        {previewUrl && (
          <img src={previewUrl} alt="" className="w-full max-h-52 object-cover rounded-xl" />
        )}
        <MealAnalysisResult analysis={analysis} />
        {rateLimit && (
          <p className="text-xs text-center text-gray-500">
            {rateLimit.remaining_requests} analyses left today ({rateLimit.limit}/
            {rateLimit.period})
          </p>
        )}
        <button
          type="button"
          onClick={onReset}
          className="w-full text-sm text-gray-500 py-2 hover:text-gray-700"
        >
          Try another photo
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => fileRef.current?.click()}
      className="w-full border-2 border-dashed border-gray-300 rounded-xl p-10 text-center bg-white hover:border-[#1D9E75] transition-colors"
    >
      <Camera className="w-10 h-10 mx-auto mb-3" style={{ color: BRAND }} />
      <p className="text-lg font-medium text-gray-900 mb-1">Upload a meal photo</p>
      <p className="text-sm text-gray-500 mb-5">
        Our AI will detect food items and estimate calories — no account needed
      </p>
      <span
        className="inline-block text-white px-6 py-2.5 rounded-lg text-sm font-medium"
        style={{ background: BRAND }}
      >
        Choose photo
      </span>
      <p className="text-xs text-gray-400 mt-4">JPEG, PNG · max 10 MB</p>
    </button>
  );
}

export default function NonUserHome() {
  const fileRef = useRef(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [rateLimit, setRateLimit] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be under 10 MB");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setAnalyzing(true);
    setAnalysis(null);

    try {
      const data = await publicAnalyzeFood(file);
      if (data.success) {
        setAnalysis(data.analysis);
        setRateLimit(data.rate_limit);
      }
    } catch {
      alert("Analysis failed. Please try again.");
      setPreviewUrl(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalyzer = () => {
    setAnalysis(null);
    setPreviewUrl(null);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <HeroSection />

      <Divider />

      {/* Features */}
      <section id="features" className="px-4 sm:px-8 py-12 max-w-5xl mx-auto scroll-mt-20">
        <SectionLabel>Features</SectionLabel>
        <h2 className="text-[22px] font-medium mb-2">Everything you need to eat better</h2>
        <p className="text-sm text-gray-500 mb-8">
          One app for food, activity, steps, and progress.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white border border-gray-200 rounded-xl p-5"
            >
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center mb-3"
                style={{ background: MINT }}
              >
                <Icon className="w-[22px] h-[22px] text-[#0F6E56]" />
              </div>
              <p className="text-[15px] font-medium mb-1.5">{title}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* How it works */}
      <section
        id="how-it-works"
        className="px-4 sm:px-8 py-12 bg-gray-50 scroll-mt-20"
      >
        <div className="max-w-xl mx-auto">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="text-[22px] font-medium mb-8">Three steps to better eating</h2>
          <div className="flex flex-col gap-6">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="flex items-start gap-4">
                <div
                  className="w-8 h-8 rounded-full text-white text-sm font-medium flex items-center justify-center shrink-0"
                  style={{ background: BRAND }}
                >
                  {n}
                </div>
                <div>
                  <p className="text-[15px] font-medium mb-1">{title}</p>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* Testimonials */}
      <section className="px-4 sm:px-8 py-12 max-w-5xl mx-auto">
        <SectionLabel>Testimonials</SectionLabel>
        <h2 className="text-[22px] font-medium mb-6">What our users say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TESTIMONIALS.map(({ quote, initials, name, city }) => (
            <div
              key={name}
              className="bg-white border border-gray-200 rounded-xl p-5"
            >
              <div className="flex gap-0.5 mb-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-current"
                    style={{ color: BRAND }}
                  />
                ))}
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                  style={{ background: MINT, color: MINT_DARK }}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-[13px] font-medium">{name}</p>
                  <p className="text-[11px] text-gray-400">{city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* Pricing */}
      <section id="pricing" className="px-4 sm:px-8 py-12 max-w-xl mx-auto scroll-mt-20">
        <SectionLabel>Pricing</SectionLabel>
        <h2 className="text-[22px] font-medium mb-2">Simple, honest pricing</h2>
        <p className="text-sm text-gray-500 mb-8">
          Start free, upgrade when you need more.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-[15px] font-medium mb-1">Free</p>
            <p className="text-[26px] font-medium mb-4">
              ₹0{" "}
              <span className="text-[13px] text-gray-400 font-normal">/ month</span>
            </p>
            {[
              "5 public analyses / day",
              "Basic meal log",
              "Step tracking",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 mb-2 text-[13px] text-gray-500">
                <Check className="w-4 h-4 shrink-0" style={{ color: BRAND }} />
                {t}
              </div>
            ))}
            {["Progress charts", "Unlimited history"].map((t) => (
              <div key={t} className="flex items-center gap-2 mb-2 text-[13px] text-gray-300">
                <X className="w-4 h-4 shrink-0" />
                {t}
              </div>
            ))}
            <Link
              to="/register"
              className="block w-full mt-4 py-2 text-center text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Get started
            </Link>
          </div>

          <div
            className="bg-white rounded-xl p-6 relative border-2"
            style={{ borderColor: BRAND }}
          >
            <Pill className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
              Most popular
            </Pill>
            <p className="text-[15px] font-medium mb-1">Pro</p>
            <p className="text-[26px] font-medium mb-4" style={{ color: BRAND }}>
              ₹299{" "}
              <span className="text-[13px] text-gray-400 font-normal">/ month</span>
            </p>
            {[
              "Unlimited analyses",
              "Full meal history",
              "Step & activity sync",
              "Progress charts",
              "Data export",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 mb-2 text-[13px] text-gray-500">
                <Check className="w-4 h-4 shrink-0" style={{ color: BRAND }} />
                {t}
              </div>
            ))}
            <Link
              to="/register"
              className="block w-full mt-4 py-2 text-center text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ background: BRAND }}
            >
              Start 3-month free trial
            </Link>
          </div>
        </div>
      </section>

      <Divider />

      {/* Live analyzer */}
      <section
        id="try-free"
        className="px-4 sm:px-8 py-12 max-w-xl mx-auto scroll-mt-24"
      >
        <div className="text-center mb-8">
          <h2 className="text-[22px] font-medium mb-2">Try it now</h2>
          <p className="text-sm text-gray-500">
            Upload a meal photo — no account needed. 5 free analyses per day.
          </p>
        </div>
        <MealAnalyzer
          fileRef={fileRef}
          analyzing={analyzing}
          previewUrl={previewUrl}
          analysis={analysis}
          rateLimit={rateLimit}
          onReset={resetAnalyzer}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/register" className="font-medium hover:underline" style={{ color: BRAND }}>
            Create a free account
          </Link>{" "}
          to save meals and track progress
        </p>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-8 py-12 text-center" style={{ background: MINT }}>
        <h2 className="text-[22px] font-medium mb-3" style={{ color: MINT_DARK }}>
          Ready to start eating smarter?
        </h2>
        <p className="text-sm mb-6" style={{ color: "#0F6E56" }}>
          Try the AI meal analyser right now — no account needed.
        </p>
        <a
          href="#try-free"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-[15px] font-medium text-white"
          style={{ background: BRAND }}
        >
          <Camera className="w-[18px] h-[18px]" />
          Analyse a meal free
        </a>
        <p className="text-xs mt-4 opacity-80" style={{ color: "#0F6E56" }}>
          No sign up · 5 free analyses per day · instant results
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-4 sm:px-8 py-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
          <CaloviaLogo
            link={false}
            imageClassName="h-[60px] w-[60px]"
            className="[&_span]:text-sm [&_span]:font-medium"
          />
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <Link
              to="/legal/privacy"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/legal/terms"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/legal"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Legal
            </Link>
            <a
              href="mailto:support@calovia.app"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Contact
            </a>
          </div>
          <p className="text-xs text-gray-400">© 2026 Calovia. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
