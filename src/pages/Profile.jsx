import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppShell from "@/components/Layout/AppShell";
import * as userApi from "@/api/user";
import { getStreak } from "@/api/user";
import { getMealSummary } from "@/api/meal";
import { getCurrentUser } from "@/slices/authSlice";
import { calculateBmi, getBmiStatus } from "@/lib/bmi";
import { formatNumber, getInitials } from "@/lib/format";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { Camera, Flame, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#24a17b]/30 focus:border-[#24a17b] outline-none";

export default function Profile() {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);
  const fileRef = useRef(null);

  const [user, setUser] = useState(null);
  const [streak, setStreak] = useState(null);
  const [mealCount, setMealCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    gender: "",
    age: "",
    weight: "",
    height: "",
    goal_weight: "",
    step_goal: 8000,
  });
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [userData, streakData, meals] = await Promise.all([
          userApi.getUser(),
          getStreak().catch(() => null),
          getMealSummary().catch(() => null),
        ]);
        setUser(userData);
        setStreak(streakData);
        setMealCount(meals?.total_meals ?? meals?.meals?.length ?? 0);
        const f = {
          full_name: userData.full_name || "",
          email: userData.email || "",
          gender: userData.gender || "",
          age: userData.age ?? "",
          weight: userData.weight ?? "",
          height: userData.height ?? "",
          goal_weight: userData.goal_weight ?? "",
          step_goal: userData.step_goal ?? 8000,
        };
        setForm(f);
        setInitial(f);
      } catch {
        toast.error("Could not load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const dirty = useMemo(() => {
    if (!initial) return false;
    return JSON.stringify(form) !== JSON.stringify(initial);
  }, [form, initial]);

  const bmi = calculateBmi(
    form.weight === "" ? null : Number(form.weight),
    form.height === "" ? null : Number(form.height)
  );
  const bmiStatus = getBmiStatus(bmi);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const profilePayload = {
        full_name: form.full_name || undefined,
        gender: form.gender || null,
        age: form.age === "" ? null : Number(form.age),
        weight: form.weight === "" ? null : Number(form.weight),
        height: form.height === "" ? null : Number(form.height),
        goal_weight: form.goal_weight === "" ? null : Number(form.goal_weight),
      };
      let updated = await userApi.updateUser(profilePayload);
      const stepGoal = Number(form.step_goal) || 8000;
      if (initial && Number(initial.step_goal) !== stepGoal) {
        updated = await userApi.updateStepGoal(stepGoal);
      }
      setUser(updated);
      setInitial({ ...form });
      dispatch(getCurrentUser());
      toast.success("Profile saved");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      await userApi.uploadAvatar(file);
      const updated = await userApi.getUser();
      setUser(updated);
      dispatch(getCurrentUser());
      toast.success("Photo updated");
    } catch {
      toast.error("Upload failed");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#24a17b]" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your personal info and goals
            </p>
          </div>
          {dirty && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="shrink-0 bg-[#24a17b] hover:bg-[#1e8a6a] text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          )}
        </header>

        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full bg-[#e8f5f0] flex items-center justify-center text-2xl font-bold text-[#24a17b] overflow-hidden">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(form.full_name, form.email)
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#24a17b] text-white flex items-center justify-center shadow-md hover:bg-[#1e8a6a] disabled:opacity-50"
                aria-label="Upload photo"
              >
                {avatarUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatar}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {form.full_name || "Your name"}
              </h2>
              <p className="text-sm text-gray-500">{form.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e8f5f0] text-[#1a7a5c]">
                Member since {memberSince}
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name">
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
            <Field label="Email">
              <input
                name="email"
                value={form.email}
                readOnly
                className={`${inputClass} bg-gray-50 text-gray-500`}
              />
            </Field>
            <Field label="Gender">
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">—</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Age">
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Body measurements</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Weight (kg)">
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
            <Field label="Height (cm)">
              <input
                type="number"
                name="height"
                value={form.height}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
            <Field label="Goal weight (kg)">
              <input
                type="number"
                name="goal_weight"
                value={form.goal_weight}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
            <Field label="BMI">
              <div className="flex items-center gap-3 px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50">
                <span className="text-2xl font-bold text-gray-900">
                  {bmi ?? "—"}
                </span>
                {bmi != null && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${bmiStatus.className}`}
                  >
                    {bmiStatus.label}
                  </span>
                )}
              </div>
            </Field>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Daily goals</h2>
            <span className="text-lg font-bold text-[#24a17b]">
              {formatNumber(form.step_goal)}
            </span>
          </div>
          <div>
            <input
              type="range"
              name="step_goal"
              min={1000}
              max={100000}
              step={500}
              value={form.step_goal}
              onChange={handleChange}
              className="w-full h-2 rounded-lg appearance-none bg-gray-200 accent-[#24a17b] cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1,000</span>
              <span>100,000</span>
            </div>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Stats at a glance</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Current streak</dt>
              <dd className="font-semibold text-gray-900 flex items-center gap-1">
                {streak?.current_streak ?? authUser?.current_streak ?? 0} days
                <Flame className="w-4 h-4 text-orange-500" />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Longest streak</dt>
              <dd className="font-semibold text-gray-900">
                {streak?.longest_streak ?? 0} days
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Total meals logged</dt>
              <dd className="font-semibold text-gray-900">{mealCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Member since</dt>
              <dd className="font-semibold text-gray-900">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-gray-500">Account role</dt>
              <dd>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e8f5f0] text-[#1a7a5c]">
                  {user?.role || "user"}
                </span>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </AppShell>
  );
}
