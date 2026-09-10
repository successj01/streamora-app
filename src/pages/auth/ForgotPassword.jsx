import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import authService from "../../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [devToken, setDevToken] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const result = await authService.forgotPassword(email.trim());

      // In development the API echoes the token so flows can be tested
      // without an SMTP provider. Never surfaced in production.
      if (result?.devResetToken) {
        setDevToken(result.devResetToken);
      }

      setSuccess(true);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0b0d] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center justify-center">

        <div className="w-full">

          {/* Back */}
          <Link
            to="/login"
            className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to sign in
          </Link>

          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="text-3xl font-bold tracking-tight"
            >
              Stream<span className="text-red-500">ora</span>
            </Link>

            <div className="mt-8">
              <h1 className="text-2xl font-semibold">
                Forgot your password?
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Enter the email address associated with your
                account and we'll send you a password reset link.
              </p>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl sm:p-8">

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <span>{error}</span>
              </div>
            )}

            {!success ? (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Email */}
                <div>
                  <label
                    htmlFor="reset-email"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                    />

                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-lg border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3 text-sm font-semibold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Sending reset link...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </form>
            ) : (
              /* Success State */
              <div className="py-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                  <CheckCircle2 size={28} />
                </div>

                <h2 className="mt-5 text-lg font-semibold">
                  Check your email
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  If an account exists for{" "}
                  <span className="font-medium text-gray-300">
                    {email}
                  </span>
                  , we've sent instructions to reset your
                  password.
                </p>

                {devToken && (
                  <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-left">
                    <p className="text-xs font-semibold text-amber-400">
                      Dev mode — reset token
                    </p>
                    <Link
                      to={`/reset-password?token=${devToken}`}
                      className="mt-1 block break-all text-xs text-amber-300 underline-offset-2 hover:underline"
                    >
                      Click here to reset your password
                    </Link>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="mt-6 text-sm font-medium text-red-500 transition hover:text-red-400"
                >
                  Try another email
                </button>
              </div>
            )}

            {/* Sign In */}
            {!success && (
              <div className="mt-6 text-center text-sm text-gray-500">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="font-medium text-white transition hover:text-red-400"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} Streamora. All rights reserved.
          </p>

        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;