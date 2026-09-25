import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FiSmartphone, FiLoader, FiSend, FiKey } from "react-icons/fi";
import {
  getAuth,
  googleProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  getFirebaseConfigured,
  getIdToken,
} from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";

const firebaseErrorMessage = (err) => {
  const messages = {
    "auth/popup-closed-by-user": "The sign-in window was closed before you finished.",

    "auth/cancelled-popup-request": "Sign-in was cancelled.",

    "auth/popup-blocked":
    "Your browser blocked the Google sign-in popup. Please allow popups and try again.",

    "auth/invalid-verification-code": "That code was incorrect. Check it and try again.",

    "auth/code-expired": "That code has expired. Request a new one.",

    "auth/invalid-phone-number": "That phone number doesn't look valid. Include your country code, e.g. +2348012345678.",

    "auth/quota-exceeded": "Too many SMS requests. Please wait a minute and retry.",

    "auth/missing-verification-code": "Enter the code you received on your phone.",

    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",

    "auth/operation-not-allowed":
    "Phone sign-in is not enabled in Firebase Authentication. Please enable Phone in Firebase Console.",

    "auth/captcha-check-failed":
    "reCAPTCHA verification failed. Please refresh the page and try again.",

   "auth/unauthorized-domain":
    "This website is not authorized for Firebase Authentication. Add the website domain in Firebase Console.",
  };

  return messages[err?.code] || err?.message || "Something went wrong. Please try again.";
};

const SocialAuth = () => {
  const navigate = useNavigate();
  const { socialLogin } = useAuth();

  const configured = getFirebaseConfigured();

  const [mode, setMode] = useState("google");
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState("");

  const redirectAfterLogin = (user) => {
    navigate(user?.isCreator ? "/dashboard" : "/", { replace: true });
  };

  const finishLogin = async (firebaseUser) => {
    const idToken = await getIdToken(firebaseUser);
    const { user } = await socialLogin(idToken);
    redirectAfterLogin(user);
  };

  const getRecaptcha = () => {
    if (!window.streamoraRecaptchaVerifier) {
      window.streamoraRecaptchaVerifier = new RecaptchaVerifier(
        getAuth(),
        "streamora-recaptcha",
        { size: "invisible" }
      );
    }
    return window.streamoraRecaptchaVerifier;
  };

  const resetRecaptcha = () => {
    if (window.streamoraRecaptchaVerifier) {
      try {
        window.streamoraRecaptchaVerifier.clear();
      } catch {
        // ignored — widget may already be torn down.
      }
    }
    window.streamoraRecaptchaVerifier = null;
  };

  useEffect(() => {
    if (!configured) return undefined;

    let cancelled = false;

    getRedirectResult(getAuth())
      .then(async (result) => {
        if (!cancelled && result?.user) {
          setBusy(true);
          await finishLogin(result.user);
        }
      })
      .catch(() => {
        // redirect result missing/expired — user can just try again.
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  if (!configured) return null;

  const handleGoogle = async () => {
    setError("");
    setBusy(true);

    try {
      const result = await signInWithPopup(getAuth(), googleProvider);
      await finishLogin(result.user);
    } catch (err) {
      if (err?.code === "auth/popup-blocked") {
        try {
          await signInWithRedirect(getAuth(), googleProvider);
          return;
        } catch (redirectErr) {
          setError(firebaseErrorMessage(redirectErr));
        }
      } else {
        setError(firebaseErrorMessage(err));
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSendCode = async (event) => {
    event?.preventDefault();
    setError("");

    if (!/^\+[1-9][0-9]{7,14}$/.test(phone.trim())) {
      setError("Enter a phone number in international format, e.g. +2348012345678.");
      return;
    }

    setBusy(true);

    try {
      resetRecaptcha();
      const verifier = getRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(
        getAuth(),
        phone.trim(),
        verifier
      );
      setConfirmation(confirmationResult);
      setOtp("");
    } catch (err) {
      resetRecaptcha();
      setError(firebaseErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();
    setError("");

    if (!confirmation) {
      setError("Request a code first.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit code you received.");
      return;
    }

    setBusy(true);

    try {
      const result = await confirmation.confirm(otp.trim());
      await finishLogin(result.user);
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const buttonBase =
    "flex w-full items-center justify-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="space-y-4">
      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={busy}
        className={`${buttonBase} border-white/10 bg-white/[0.03] text-gray-200 hover:bg-white/[0.07]`}
      >
        {busy ? (
          <FiLoader size={18} className="animate-spin text-purple-400" />
        ) : (
          <FcGoogle size={19} />
        )}
        {busy ? "Signing in..." : "Continue with Google"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-gray-600">
        <span className="h-px flex-1 bg-white/10" />
        or
        <span className="h-px flex-1 bg-white/10" />
      </div>

      {/* Phone toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("google");
            setError("");
          }}
          className={`rounded-lg border px-3 py-2 text-sm transition ${
            mode === "google"
              ? "border-purple-500/60 bg-purple-500/10 text-purple-300"
              : "border-white/10 text-gray-400 hover:text-gray-200"
          }`}
        >
          Google
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("phone");
            setError("");
          }}
          className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition ${
            mode === "phone"
              ? "border-purple-500/60 bg-purple-500/10 text-purple-300"
              : "border-white/10 text-gray-400 hover:text-gray-200"
          }`}
        >
          <FiSmartphone size={15} />
          Phone
        </button>
      </div>

      {/* Phone OTP flow */}
      {mode === "phone" && (
        <div className="space-y-3">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          {!confirmation ? (
            <form onSubmit={handleSendCode} className="space-y-3">
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+2348012345678"
                disabled={busy}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
              />
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <FiLoader size={17} className="animate-spin text-purple-400" />
                ) : (
                  <FiSend size={16} />
                )}
                {busy ? "Sending code..." : "Send verification code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-3">
              <p className="text-sm text-gray-500">
                Enter the 6-digit code sent to{" "}
                <span className="font-medium text-gray-300">{phone.trim()}</span>
              </p>
              <div className="relative">
                <FiKey
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="123456"
                  disabled={busy}
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm tracking-[0.3em] text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <FiLoader size={17} className="animate-spin" />
                ) : (
                  <FiKey size={16} />
                )}
                {busy ? "Verifying..." : "Verify & continue"}
              </button>
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmation(null);
                    setOtp("");
                    setError("");
                  }}
                  className="text-gray-500 transition hover:text-gray-300"
                >
                  Change number
                </button>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={busy}
                  className="font-medium text-purple-400 transition hover:text-purple-300 disabled:opacity-50"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}

          <div id="streamora-recaptcha" />
        </div>
      )}

      {mode === "google" && error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default SocialAuth;