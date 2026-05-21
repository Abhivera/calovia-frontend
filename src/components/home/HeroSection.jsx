import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Camera,
  Check,
  Footprints,
  Flame,
  Egg,
  Soup,
  Apple,
} from "lucide-react";

const BRAND = "#1D9E75";
const MINT = "#E1F5EE";
const MINT_DARK = "#085041";
const MINT_TEXT = "#0F6E56";
const HEADLINE = "#04342C";

const CAL_GOAL = 2500;
const CAL_CURRENT = 1250;
const RING_CIRC = 201;
const RING_OFFSET_START = RING_CIRC;
const RING_OFFSET_END = RING_CIRC - (CAL_CURRENT / CAL_GOAL) * RING_CIRC;

const MEALS = [
  {
    icon: Egg,
    name: "Masala omelette",
    meta: "8:30 AM · eggs, onion, chilli",
    kcal: 380,
  },
  {
    icon: Soup,
    name: "Dal rice & sabzi",
    meta: "1:04 PM · lentils, rice, spinach",
    kcal: 720,
  },
  {
    icon: Apple,
    name: "Fruit bowl",
    meta: "4:15 PM · banana, papaya",
    kcal: 150,
  },
];

const MACROS = [
  { label: "Protein", value: "54g", pct: 72, color: BRAND, delay: "0.8s" },
  { label: "Carbs", value: "143g", pct: 65, color: "#FAC775", delay: "0.95s" },
  { label: "Fat", value: "41g", pct: 48, color: "#F0997B", delay: "1.1s" },
  { label: "Sugar", value: "21g", pct: 38, color: "#9FE1CB", delay: "1.25s" },
];

function countUp(target, duration, onUpdate, decimals = false) {
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const current = target * p;
    onUpdate(
      decimals ? Number(current.toFixed(1)) : Math.round(current)
    );
    if (p < 1) requestAnimationFrame(step);
    else onUpdate(target);
  };
  requestAnimationFrame(step);
}

function Pill({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${className}`}
      style={{ background: MINT, color: MINT_DARK }}
    >
      {children}
    </span>
  );
}

function MealRow({ icon: Icon, name, meta, kcal }) {
  return (
    <div
      className="flex items-center gap-2.5 py-2 border-b last:border-b-0"
      style={{ borderColor: MINT }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: MINT }}
      >
        <Icon className="w-[18px] h-[18px]" style={{ color: MINT_TEXT }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-gray-900 truncate">{name}</p>
        <p className="text-[11px] text-gray-400 truncate">{meta}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[13px] font-medium text-gray-900">{kcal}</p>
        <p className="text-[10px] text-gray-400">kcal</p>
      </div>
    </div>
  );
}

function DashboardPreview({ animate }) {
  const [cal, setCal] = useState(0);
  const [steps, setSteps] = useState(0);
  const [streak, setStreak] = useState(0);
  const [burned, setBurned] = useState(0);
  const [ringOffset, setRingOffset] = useState(RING_OFFSET_START);
  const [calBarWidth, setCalBarWidth] = useState(0);
  const [macroWidths, setMacroWidths] = useState(MACROS.map(() => 0));

  useEffect(() => {
    if (!animate) return;

    const t = setTimeout(() => {
      countUp(1250, 1400, setCal);
      countUp(8500, 1400, setSteps);
      countUp(5, 800, setStreak);
      countUp(420, 1200, setBurned);
      setRingOffset(RING_OFFSET_END);
      setCalBarWidth(50);

      MACROS.forEach((m, i) => {
        setTimeout(() => {
          setMacroWidths((prev) => {
            const next = [...prev];
            next[i] = m.pct;
            return next;
          });
        }, 800 + i * 150);
      });
    }, 400);

    return () => clearTimeout(t);
  }, [animate]);

  return (
    <div className="relative pb-0">
      <div
        className="bg-white border border-gray-200 rounded-t-2xl p-4 hero-dashboard-card"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[13px] text-gray-500">Good morning, Jane</p>
            <p className="text-[15px] font-medium text-gray-900">Wednesday, 20 May</p>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
            style={{ background: MINT, color: MINT_DARK }}
          >
            JD
          </div>
        </div>

        <div className="flex gap-2.5 mb-4">
          <div
            className="shrink-0 rounded-xl p-3 flex flex-col items-center min-w-[110px]"
            style={{ background: MINT }}
          >
            <div className="relative w-20 h-20">
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                className="-rotate-90"
                aria-hidden
              >
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="#9FE1CB"
                  strokeWidth="7"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke={BRAND}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRC}
                  strokeDashoffset={ringOffset}
                  style={{ transition: "stroke-dashoffset 1.5s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p
                  className="text-base font-medium leading-none"
                  style={{ color: MINT_DARK }}
                >
                  {cal.toLocaleString()}
                </p>
                <p className="text-[10px]" style={{ color: MINT_TEXT }}>
                  kcal
                </p>
              </div>
            </div>
            <p
              className="text-[11px] font-medium mt-1.5"
              style={{ color: MINT_DARK }}
            >
              of 2,500 goal
            </p>
            <div
              className="rounded h-[3px] w-full mt-1.5 overflow-hidden"
              style={{ background: "#9FE1CB" }}
            >
              <div
                className="h-full rounded transition-[width] duration-[1.5s] ease-out"
                style={{ background: BRAND, width: `${calBarWidth}%` }}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <div className="bg-gray-50 rounded-lg px-2.5 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Footprints className="w-[15px] h-[15px]" style={{ color: BRAND }} />
                <span className="text-xs text-gray-500">Steps today</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {steps.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-400">goal 8,000</p>
              </div>
            </div>

            <div
              className="rounded-lg px-2.5 py-2 flex items-center justify-between"
              style={{ background: MINT }}
            >
              <div className="flex items-center gap-1.5">
                <Flame className="w-[15px] h-[15px]" style={{ color: MINT_TEXT }} />
                <span className="text-xs" style={{ color: MINT_DARK }}>
                  Streak
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: MINT_DARK }}>
                  {streak}
                </p>
                <p className="text-[10px]" style={{ color: MINT_TEXT }}>
                  days
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg px-2.5 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Flame className="w-[15px] h-[15px] text-[#F0997B]" />
                <span className="text-xs text-gray-500">Burned</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{burned}</p>
                <p className="text-[10px] text-gray-400">kcal</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-2.5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-medium text-gray-900">Today&apos;s meals</p>
            <span className="text-[11px] cursor-pointer" style={{ color: BRAND }}>
              View all
            </span>
          </div>

          {MEALS.map((meal) => (
            <MealRow key={meal.name} {...meal} />
          ))}

          <a
            href="#try-free"
            className="mt-2 flex items-center justify-center gap-1.5 py-2 border border-dashed rounded-lg transition-colors hover:bg-[#E1F5EE]/50"
            style={{ borderColor: "#9FE1CB" }}
          >
            <Camera className="w-3.5 h-3.5" style={{ color: BRAND }} />
            <span className="text-xs font-medium" style={{ color: BRAND }}>
              Log another meal
            </span>
          </a>
        </div>
      </div>

      <div
        className="bg-white border-x border-b border-gray-200 px-3.5 py-3 hero-macros-card"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[13px] font-medium text-gray-900">Macros today</p>
          <span className="text-[11px] text-gray-400">1,250 kcal total</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {MACROS.map((m, i) => (
            <div key={m.label}>
              <div className="flex justify-between mb-0.5">
                <span className="text-[11px] text-gray-500">{m.label}</span>
                <span className="text-[11px] font-medium text-gray-900">
                  {m.value}
                </span>
              </div>
              <div
                className="rounded h-[5px] overflow-hidden"
                style={{ background: MINT }}
              >
                <div
                  className="h-full rounded transition-[width] duration-[1.4s] ease-out"
                  style={{
                    background: m.color,
                    width: `${macroWidths[i]}%`,
                    transitionDelay: m.delay,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const TRUST_ITEMS = ["No credit card", "iOS & Android", "Free plan forever"];

export default function HeroSection() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <>
      <section className="px-4 sm:px-6 pt-8 sm:pt-12 pb-0" style={{ background: MINT }}>
        <div className="max-w-[900px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-end">
          <div className="pb-8 lg:pb-12">
            <Pill className="mb-5 hero-anim-1">
              <Sparkles className="w-3 h-3" />
              AI-powered nutrition tracking
            </Pill>

            <h1
              className="text-[28px] sm:text-[32px] font-medium leading-tight mb-4 hero-anim-2"
              style={{ color: HEADLINE }}
            >
              Snap a photo.
              <br />
              Know your
              <br />
              calories instantly.
            </h1>

            <p
              className="text-sm leading-relaxed mb-7 max-w-[340px] hero-anim-3"
              style={{ color: MINT_TEXT }}
            >
              Dietly uses AI to detect food from photos and track your calories,
              macros, steps, and streaks — all in one clean dashboard.
            </p>

            <div className="flex flex-wrap gap-2.5 mb-6 hero-anim-4">
              <a
                href="#try-free"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white"
                style={{ background: BRAND }}
              >
                <Camera className="w-4 h-4" />
                Analyse a meal free
              </a>
              <Link
                to="/register"
                className="px-4 py-2.5 rounded-lg text-sm border bg-white transition-colors hover:bg-gray-50"
                style={{ borderColor: "#5DCAA5", color: MINT_DARK }}
              >
                See dashboard
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-5 hero-anim-5">
              {TRUST_ITEMS.map((label) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: BRAND }} />
                  <span className="text-xs" style={{ color: MINT_DARK }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md lg:max-w-none mx-auto lg:mx-0">
            <DashboardPreview animate={animate} />
          </div>
        </div>
      </section>

      <section className="bg-gray-50 border-t border-gray-200 py-6 px-4 sm:px-6">
        <div className="max-w-[900px] mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            ["50k+", "meals analysed"],
            ["8k+", "active users"],
            ["87%", "AI accuracy"],
            ["4.8", "app store rating"],
          ].map(([val, label], i) => (
            <div
              key={label}
              className={`text-center py-3 px-3 border-gray-200 ${
                i < 3 ? "border-r" : ""
              } ${i < 2 ? "border-b md:border-b-0" : ""}`}
            >
              <p className="text-[22px] font-medium" style={{ color: BRAND }}>
                {val}
              </p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
