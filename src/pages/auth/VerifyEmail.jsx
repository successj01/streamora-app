import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import authService from "../../services/authService";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token. Check your email link and try again.");
      return;
    }

    if (hasRun.current) return;
    hasRun.current = true;

    authService
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified. You can now sign in.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err?.response?.data?.message ||
            err?.message ||
            "This verification link is invalid or has expired."
        );
      });
  }, [token]);

  return (
    <main className="min-h-screen bg-[#0b0b0d] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl">
          <Link to="/" className="text-3xl font-bold tracking-tight">
            Stream<span className="text-red-500">ora</span>
          </Link>

          <div className="mt-8">
            {status === "verifying" && (
              <div className="flex flex-col items-center">
                <Loader2 size={36} className="animate-spin text-red-500" />
                <h1 className="mt-5 text-xl font-semibold">Verifying your email...</h1>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                  <CheckCircle2 size={28} />
                </div>
                <h1 className="mt-5 text-xl font-semibold">Email verified</h1>
                <p className="mt-2 text-sm leading-6 text-gray-500">{message}</p>
                <Link
                  to="/login"
                  className="mt-6 w-full rounded-lg bg-red-600 py-3 text-sm font-semibold transition hover:bg-red-700"
                >
                  Continue to sign in
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                  <AlertCircle size={28} />
                </div>
                <h1 className="mt-5 text-xl font-semibold">Verification failed</h1>
                <p className="mt-2 text-sm leading-6 text-gray-500">{message}</p>
                <Link
                  to="/"
                  className="mt-6 text-sm font-medium text-red-500 transition hover:text-red-400"
                >
                  Back to Streamora
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default VerifyEmail;