import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/Layout/AppShell";
import Toggle from "@/components/ui/Toggle";
import { loadSettings, saveSettings } from "@/lib/settingsStorage";
import { logout } from "@/slices/authSlice";
import { toast } from "react-toastify";

function SettingsCard({ title, children, danger }) {
  return (
    <section
      className={`bg-white border rounded-xl overflow-hidden ${
        danger ? "border-red-200" : "border-gray-200"
      }`}
    >
      {title && (
        <h2
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b ${
            danger
              ? "text-red-700 border-red-100 bg-red-50/50"
              : "text-gray-500 border-gray-100"
          }`}
        >
          {title}
        </h2>
      )}
      <div className="px-5 divide-y divide-gray-100">{children}</div>
    </section>
  );
}

function RowButton({ label, description, buttonLabel, onClick, variant = "default" }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClick}
        className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
          variant === "danger"
            ? "border-red-300 text-red-700 hover:bg-red-50"
            : "border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

export default function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(() => loadSettings());
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);

  const update = (partial) => {
    const next = saveSettings(partial);
    setSettings(next);
  };

  const handleSignOut = () => {
    dispatch(logout());
    navigate("/login");
    toast.info("Signed out");
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            App preferences and account management
          </p>
        </header>

        <SettingsCard title="Notifications">
          <Toggle
            label="Daily meal reminder"
            description="Nudge to log meals each day"
            checked={settings.dailyMealReminder}
            onChange={(v) => update({ dailyMealReminder: v })}
          />
          <Toggle
            label="Step goal reached"
            description="Celebrate when you hit 8,000 steps"
            checked={settings.stepGoalReached}
            onChange={(v) => update({ stepGoalReached: v })}
          />
          <Toggle
            label="Streak alerts"
            description="Remind before your streak breaks"
            checked={settings.streakAlerts}
            onChange={(v) => update({ streakAlerts: v })}
          />
          <Toggle
            label="Weekly summary"
            description="Email digest every Sunday"
            checked={settings.weeklySummary}
            onChange={(v) => update({ weeklySummary: v })}
          />
        </SettingsCard>

        <SettingsCard title="Health data sync">
          <Toggle
            label="Apple Health"
            description="Sync steps via HealthKit"
            checked={settings.appleHealth}
            onChange={(v) => update({ appleHealth: v })}
          />
          <Toggle
            label="Google Health Connect"
            description="Sync steps via Health Connect"
            checked={settings.googleHealth}
            onChange={(v) => update({ googleHealth: v })}
          />
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Auto-sync frequency
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                How often to pull step data
              </p>
            </div>
            <select
              value={settings.syncFrequency}
              onChange={(e) => update({ syncFrequency: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
            >
              <option value="1h">Every hour</option>
              <option value="6h">Every 6 hours</option>
              <option value="12h">Every 12 hours</option>
              <option value="24h">Once daily</option>
            </select>
          </div>
        </SettingsCard>

        <SettingsCard title="Display">
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Calorie goal</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Daily calorie target shown on dashboard
              </p>
            </div>
            <input
              type="number"
              min={1200}
              max={5000}
              step={50}
              value={settings.calorieGoal}
              onChange={(e) =>
                update({ calorieGoal: Number(e.target.value) || 2500 })
              }
              className="w-24 text-sm border border-gray-200 rounded-lg px-3 py-2 text-right"
            />
          </div>
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Units</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Weight and distance units
              </p>
            </div>
            <select
              value={settings.units}
              onChange={(e) => update({ units: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
            >
              <option value="metric">Metric (kg, km)</option>
              <option value="imperial">Imperial (lb, mi)</option>
            </select>
          </div>
          <Toggle
            label="Show exercise recommendations"
            description="Steps/km to burn off meals"
            checked={settings.showExerciseRec}
            onChange={(v) => update({ showExerciseRec: v })}
          />
        </SettingsCard>

        <SettingsCard title="Security">
          <RowButton
            label="Change password"
            description="Update your login credentials"
            buttonLabel="Update"
            onClick={() =>
              toast.info("Password change will be available in a future update")
            }
          />
          <RowButton
            label="Session token"
            description="JWT · expires in 7 days"
            buttonLabel="Sign out"
            onClick={handleSignOut}
          />
        </SettingsCard>

        <SettingsCard title="Danger zone" danger>
          <button
            type="button"
            onClick={() => toast.info("Export started — check your email")}
            className="w-full py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 my-4"
          >
            Export my data
          </button>
          <button
            type="button"
            onClick={() => setDeleteWarningOpen((o) => !o)}
            className="w-full py-3 text-sm font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50 mb-4"
          >
            Delete my account
          </button>
          {deleteWarningOpen && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 space-y-3">
              <p className="font-semibold">
                This permanently deletes your account, meals, and activity data.
                This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteWarningOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-red-300 text-red-700 font-medium hover:bg-red-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.error(
                      "Account deletion requires backend support — contact support"
                    );
                    setDeleteWarningOpen(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
                >
                  Yes, delete everything
                </button>
              </div>
            </div>
          )}
        </SettingsCard>
      </div>
    </AppShell>
  );
}
