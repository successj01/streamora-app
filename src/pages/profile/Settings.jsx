import React, { useState, useEffect, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  User,
  Bell,
  Lock,
  Palette,
  Shield,
  Globe,
  ChevronRight,
  Save,
  LogOut,
  CheckCircle2,
  Loader2,
  AlertCircle,
  KeyRound,
} from "lucide-react";

import Loader from "../../components/common/Loader";

import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";
import authService from "../../services/authService";

const STORAGE_KEY = "streamora_theme";

const SECTIONS = [
  { id: "profile", label: "Profile", description: "Manage your public information", icon: User },
  { id: "notifications", label: "Notifications", description: "Control your notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", description: "Protect your account", icon: Lock },
  { id: "appearance", label: "Appearance", description: "Customize Streamora", icon: Palette },
];

const NOTIFICATION_OPTIONS = [
  { key: "email", title: "Email notifications", description: "Receive important account updates by email." },
  { key: "live", title: "Live stream notifications", description: "Get notified when creators you follow go live." },
  { key: "followers", title: "Follower notifications", description: "Get notified when someone follows your profile." },
  { key: "recommendations", title: "Recommendations", description: "Receive personalized content recommendations." },
];

const LANGUAGES = ["English", "French", "Spanish", "Portuguese"];
const REGIONS = ["Nigeria", "United Kingdom", "United States", "Canada", "Ghana"];

const DEFAULT_NOTIFICATIONS = {
  email: true,
  live: true,
  followers: true,
  recommendations: false,
};

const Settings = () => {
  const { user, isAuthenticated, loading: authLoading, updateUser, logout } = useAuth();

  const [activeSection, setActiveSection] = useState("profile");
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  const [profile, setProfile] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
  });

  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [language, setLanguage] = useState("English");
  const [region, setRegion] = useState("Nigeria");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    setProfile({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      bio: user.bio || "",
    });
    setLanguage(user.language || "English");
    setRegion(user.region || "Nigeria");
    setNotifications({ ...DEFAULT_NOTIFICATIONS, ...(user.notifications || {}) });
  }, [user]);

  const markDirty = useCallback(() => {
    setSaved(false);
    setError("");
  }, []);

  const flashSaved = useCallback(() => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }, []);

  const runSave = async (action) => {
    setSaving(true);
    setError("");

    try {
      const data = await action();
      const updated = data?.user || data;

      if (updated && updated.username) {
        await updateUser(updated);
      }

      flashSaved();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save your changes."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = () =>
    runSave(() =>
      userService.updateProfile({
        name: profile.name,
        username: profile.username,
        email: profile.email,
        bio: profile.bio,
      })
    );

  const handleSaveNotifications = () =>
    runSave(() => userService.updateProfile({ notifications }));

  const handleSaveAppearance = () =>
    runSave(() => userService.updateProfile({ language, region }));

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* silent */
    }
  }, [theme]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f10]">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    markDirty();
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    markDirty();
  };

  return (
    <main className="min-h-screen bg-app-bg px-4 py-6 text-app-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-red-500">Account</p>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Settings</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-app-muted">
                Manage your Streamora profile, notifications, privacy, appearance and account preferences.
              </p>
            </div>

            <Link
              to="/profile"
              className="flex w-fit items-center gap-2 rounded-lg border border-app-border px-4 py-2.5 text-sm font-medium text-app-muted transition hover:bg-app-hover hover:text-app-text"
            >
              <User size={16} />
              View Profile
            </Link>
          </div>
        </header>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            <AlertCircle size={18} className="shrink-0" />
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-red-400 hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <nav className="h-fit rounded-xl border border-app-border bg-surface p-2" aria-label="Settings sections">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`group flex w-full items-center gap-3 rounded-lg p-3 text-left transition ${
                    isActive
                      ? "bg-red-500/10 text-red-500"
                      : "text-app-muted hover:bg-app-hover hover:text-app-text"
                  }`}
                >
                  <Icon size={18} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{section.label}</p>
                    <p className="mt-0.5 truncate text-[11px] text-app-muted opacity-60">{section.description}</p>
                  </div>
                  <ChevronRight
                    size={15}
                    className={`transition ${isActive ? "text-red-500" : "text-app-muted opacity-40 group-hover:opacity-100"}`}
                  />
                </button>
              );
            })}
          </nav>

          <section className="min-w-0 overflow-hidden rounded-xl border border-app-border bg-surface">
            {activeSection === "profile" && (
              <ProfileSection
                profile={profile}
                onChange={handleProfileChange}
                saving={saving}
                saved={saved}
                onSave={handleSaveProfile}
              />
            )}

            {activeSection === "notifications" && (
              <NotificationsSection
                notifications={notifications}
                onToggle={toggleNotification}
                saving={saving}
                saved={saved}
                onSave={handleSaveNotifications}
              />
            )}

            {activeSection === "privacy" && (
              <PrivacySection />
            )}

            {activeSection === "appearance" && (
              <AppearanceSection
                theme={theme}
                onThemeChange={setTheme}
                language={language}
                onLanguageChange={(val) => { setLanguage(val); markDirty(); }}
                region={region}
                onRegionChange={(val) => { setRegion(val); markDirty(); }}
                saving={saving}
                saved={saved}
                onSave={handleSaveAppearance}
              />
            )}
          </section>
        </div>

        <AccountSection onLogout={logout} />
      </div>
    </main>
  );
};

const SettingsHeader = ({ title, description }) => (
  <div className="border-b border-app-border p-5 sm:p-6">
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="mt-1 text-sm leading-6 text-app-muted">{description}</p>
  </div>
);

const SettingsFooter = ({ saving, saved, onSave }) => {
  const preventDefaultSave = (event) => {
    event?.preventDefault();
    onSave();
  };

  return (
    <div className="flex flex-col gap-3 border-t border-app-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="min-h-[20px]">
        {saved && (
          <p className="flex items-center gap-2 text-xs font-medium text-green-500">
            <CheckCircle2 size={15} />
            Changes saved successfully.
          </p>
        )}
      </div>
      <button
        type="submit"
        onClick={preventDefaultSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

const SettingsInput = ({ id, label, type = "text", value, onChange, placeholder, prefix }) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-sm font-medium text-app-muted">{label}</label>
    {prefix ? (
      <div className="flex overflow-hidden rounded-lg border border-app-border bg-surface-secondary">
        <span className="flex items-center border-r border-app-border px-3 text-sm text-app-muted opacity-60">{prefix}</span>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent px-3 py-3 text-sm text-app-text outline-none"
        />
      </div>
    ) : (
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-app-border bg-surface-secondary px-4 py-3 text-sm text-app-text outline-none transition placeholder:text-app-muted focus:border-red-500/50"
      />
    )}
  </div>
);

const ProfileSection = ({ profile, onChange, saving, saved, onSave }) => (
  <form onSubmit={(event) => { event.preventDefault(); onSave(); }}>
    <SettingsHeader title="Profile Information" description="Update the information displayed on your Streamora profile." />
    <div className="space-y-5 p-5 sm:p-6">
      <SettingsInput id="name" label="Display name" value={profile.name} onChange={onChange} placeholder="Your display name" />
      <SettingsInput id="username" label="Username" value={profile.username} onChange={onChange} prefix="@" />
      <SettingsInput id="email" label="Email address" type="email" value={profile.email} onChange={onChange} />
      <div>
        <label htmlFor="bio" className="mb-2 block text-sm font-medium text-app-muted">Bio</label>
        <textarea
          id="bio"
          name="bio"
          value={profile.bio}
          onChange={onChange}
          maxLength={300}
          rows={4}
          className="w-full resize-none rounded-lg border border-app-border bg-surface-secondary px-4 py-3 text-sm text-app-text outline-none transition focus:border-red-500/50"
        />
        <p className="mt-1 text-right text-xs text-app-muted opacity-60">{profile.bio.length}/300</p>
      </div>
    </div>
    <SettingsFooter saving={saving} saved={saved} onSave={onSave} />
  </form>
);

const NotificationsSection = ({ notifications, onToggle, saving, saved, onSave }) => (
  <div>
    <SettingsHeader title="Notifications" description="Choose which notifications you want to receive from Streamora." />
    <div className="divide-y divide-app-border">
      {NOTIFICATION_OPTIONS.map((opt) => (
        <NotificationToggle
          key={opt.key}
          title={opt.title}
          description={opt.description}
          checked={notifications[opt.key] || false}
          onChange={() => onToggle(opt.key)}
        />
      ))}
    </div>
    <SettingsFooter saving={saving} saved={saved} onSave={onSave} />
  </div>
);

const NotificationToggle = ({ title, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-5 p-5 sm:p-6">
    <div className="min-w-0">
      <p className="text-sm font-medium text-app-text">{title}</p>
      <p className="mt-1 text-xs leading-5 text-app-muted">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`Toggle ${title}`}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-red-600" : "bg-surface-tertiary"}`}
    >
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
    </button>
  </div>
);

const PasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setNotice("Password updated successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to change your password."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-app-border p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-app-hover">
          <KeyRound size={17} className="text-red-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Change password</h3>
          <p className="mt-1 text-xs leading-5 text-app-muted">
            Use at least 8 characters with a mix of letters and numbers.
          </p>
        </div>
      </div>

      {(error || notice) && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 text-xs ${
            error
              ? "border-red-500/20 bg-red-500/5 text-red-400"
              : "border-green-500/20 bg-green-500/5 text-green-400"
          }`}
        >
          {error ? <AlertCircle size={14} className="shrink-0" /> : <CheckCircle2 size={14} className="shrink-0" />}
          <p>{error || notice}</p>
        </div>
      )}

      <SettingsInput
        id="currentPassword"
        label="Current password"
        type="password"
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.target.value)}
        placeholder="Enter your current password"
      />

      <SettingsInput
        id="newPassword"
        label="New password"
        type="password"
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        placeholder="Enter a new password"
      />

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
        {saving ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
};

const PrivacySection = () => (
  <div>
    <SettingsHeader title="Privacy & Security" description="Manage your account security and privacy preferences." />
    <div className="space-y-3 p-5 sm:p-6">
      <div className="flex items-center gap-4 rounded-xl border border-app-border p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-app-hover">
          <Lock size={17} className="text-app-muted" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-app-text">Account password</p>
          <p className="mt-1 text-xs leading-5 text-app-muted">
            Keep your account secure by using a strong, unique password.
          </p>
        </div>
      </div>

      <PasswordForm />

      <div className="flex items-center gap-4 rounded-xl border border-app-border p-4 opacity-60">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-app-hover">
          <Shield size={17} className="text-app-muted" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-app-text">Two-factor authentication</p>
          <p className="mt-1 text-xs leading-5 text-app-muted">
            Add another layer of protection to your account (coming soon).
          </p>
        </div>
      </div>
    </div>
  </div>
);

const AppearanceSection = ({ theme, onThemeChange, language, onLanguageChange, region, onRegionChange, saving, saved, onSave }) => (
  <div>
    <SettingsHeader title="Appearance" description="Customize the way Streamora looks and behaves." />
    <div className="space-y-8 p-5 sm:p-6">
      <div>
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-app-hover">
            <Palette size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Theme</h3>
            <p className="mt-1 text-xs text-app-muted">Choose your preferred Streamora theme.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ThemeCard
            label="Dark"
            description="Recommended for Streamora"
            preview="dark"
            isActive={theme === "dark"}
            onClick={() => onThemeChange("dark")}
          />
          <ThemeCard
            label="Light"
            description="Bright interface"
            preview="light"
            isActive={theme === "light"}
            onClick={() => onThemeChange("light")}
          />
        </div>
      </div>

      <div className="border-t border-app-border pt-7">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-app-hover">
            <Globe size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Language & Region</h3>
            <p className="mt-1 text-xs text-app-muted">Choose your preferred language and region.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SettingsSelect id="language" label="Language" value={language} onChange={onLanguageChange} options={LANGUAGES} />
          <SettingsSelect id="region" label="Region" value={region} onChange={onRegionChange} options={REGIONS} />
        </div>
      </div>
    </div>
    <SettingsFooter saving={saving} saved={saved} onSave={onSave} />
  </div>
);

const ThemeCard = ({ label, description, preview, isActive, onClick }) => {
  const isDark = preview === "dark";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl p-4 text-left transition ${isActive ? "border-2 border-red-500" : "border border-app-border"}`}
    >
      <div className={`h-20 rounded-lg p-3 ${isDark ? "bg-[#0f0f10]" : "bg-gray-100"}`}>
        <div className={`h-2 w-1/2 rounded ${isDark ? "bg-white/10" : "bg-gray-300"}`} />
        <div className={`mt-3 h-2 w-3/4 rounded ${isDark ? "bg-white/5" : "bg-gray-200"}`} />
      </div>
      <p className="mt-3 text-sm font-semibold">{label}</p>
      <p className="mt-1 text-xs text-app-muted">{description}</p>
    </button>
  );
};

const SettingsSelect = ({ id, label, value, onChange, options }) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-xs font-medium text-app-muted">{label}</label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-app-border bg-surface-secondary px-4 py-3 text-sm text-app-text outline-none transition focus:border-red-500/50"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const AccountSection = ({ onLogout }) => (
  <div className="mt-6 rounded-xl border border-red-500/10 bg-red-500/[0.03] p-5 sm:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-sm font-semibold">Account</h2>
        <p className="mt-1 text-xs text-app-muted">Manage your profile or sign out of Streamora.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          to="/profile"
          className="flex items-center justify-center gap-2 rounded-lg border border-app-border px-4 py-2.5 text-sm font-medium text-app-muted transition hover:bg-app-hover hover:text-app-text"
        >
          <User size={16} />
          View Profile
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center justify-center gap-2 rounded-lg border border-red-500/20 px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-500/10"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  </div>
);

export default Settings;