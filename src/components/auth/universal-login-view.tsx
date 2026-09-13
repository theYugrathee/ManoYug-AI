"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { loginAction, instituteLoginAction } from "@/lib/auth/actions";

export function UniversalLoginView({
  initialType = "student",
  nextPath = "/student",
}: {
  initialType?: "student" | "institute";
  nextPath?: string;
}) {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"student" | "institute">(initialType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Student Form State
  const [studentInstituteCode, setStudentInstituteCode] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  // Institute Form State
  const [instituteCode, setInstituteCode] = useState("");
  const [institutePassword, setInstitutePassword] = useState("");

  async function handleStudentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    const formData = new FormData();
    if (studentInstituteCode.trim()) {
      formData.append("instituteCode", studentInstituteCode.trim().toUpperCase());
    }
    formData.append("email", studentEmail);
    formData.append("password", studentPassword);
    formData.append("next", nextPath);

    try {
      const res = await loginAction(null, formData);
      if (!res.ok) {
        setError(res.message);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        setLoading(false);
        return;
      }
      router.push(res.redirectTo ?? "/student");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  async function handleInstituteSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    const formData = new FormData();
    formData.append("instituteCode", instituteCode.trim().toUpperCase());
    formData.append("password", institutePassword);

    try {
      const res = await instituteLoginAction(null, formData);
      if (!res.ok) {
        setError(res.message);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        setLoading(false);
        return;
      }
      router.push(res.redirectTo ?? "/institution");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-7">
      {/* Header with Logo */}
      <div className="flex flex-col items-center text-center space-y-2.5">
        <Link href="/" className="inline-flex items-center gap-2.5 group mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F172A] text-white font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
            <span className="font-display">M</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0F172A] font-display">
            ManoYug AI
          </span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] font-display">
          {accountType === "student" ? "Welcome back" : "Institution Portal"}
        </h1>
        <p className="text-xs text-[#64748B]">
          {accountType === "student"
            ? "Sign in to continue your confidential wellbeing journey"
            : "Sign in with your campus administrative credentials"}
        </p>
      </div>

      {/* Role Toggle */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
        <button
          type="button"
          onClick={() => {
            setAccountType("student");
            setError(null);
            setFieldErrors({});
          }}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            accountType === "student"
              ? "bg-white text-[#0F172A] border border-[#CBD5E1] shadow-xs"
              : "text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          <span>🎓 Student</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setAccountType("institute");
            setError(null);
            setFieldErrors({});
          }}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            accountType === "institute"
              ? "bg-white text-[#0F172A] border border-[#CBD5E1] shadow-xs"
              : "text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          <span>🏛️ Institution</span>
        </button>
      </div>

      {error ? (
        <Alert tone="danger" role="alert">
          {error}
        </Alert>
      ) : null}

      {/* ─── STUDENT LOGIN FORM ─── */}
      {accountType === "student" && (
        <form onSubmit={handleStudentSubmit} className="space-y-4 my-fade-in-up">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#475569]" htmlFor="student-institute-code">
              Institution Code <span className="text-[11px] text-[#94A3B8]">(Optional if already linked)</span>
            </label>
            <Input
              id="student-institute-code"
              type="text"
              autoCapitalize="characters"
              placeholder="e.g. DU-2026 or IITD-001"
              value={studentInstituteCode}
              onChange={(e) => setStudentInstituteCode(e.target.value.toUpperCase())}
              disabled={loading}
              className="font-mono text-sm uppercase"
            />
            {fieldErrors.instituteCode ? (
              <p className="text-xs text-rose-600">{fieldErrors.instituteCode}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#475569]" htmlFor="student-email">
              Email Address
            </label>
            <Input
              id="student-email"
              type="email"
              required
              autoComplete="email"
              placeholder="student@university.ac.in"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              disabled={loading}
            />
            {fieldErrors.email ? (
              <p className="text-xs text-rose-600">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#475569]" htmlFor="student-password">
                Password
              </label>
              <Link href="/help" className="text-[11px] text-[#0F172A] font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="student-password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={studentPassword}
              onChange={(e) => setStudentPassword(e.target.value)}
              disabled={loading}
            />
            {fieldErrors.password ? (
              <p className="text-xs text-rose-600">{fieldErrors.password}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={loading} size="lg" className="w-full mt-2 font-semibold">
            {loading ? "Signing in..." : "Sign in →"}
          </Button>

          <div className="pt-2 text-center text-xs text-[#64748B]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register/student"
              className="font-semibold text-[#0F172A] hover:underline"
            >
              Create account
            </Link>
          </div>
        </form>
      )}

      {/* ─── INSTITUTE ADMIN LOGIN FORM ─── */}
      {accountType === "institute" && (
        <form onSubmit={handleInstituteSubmit} className="space-y-4 my-fade-in-up">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#475569]" htmlFor="institute-code">
              Institution Code
            </label>
            <Input
              id="institute-code"
              type="text"
              required
              placeholder="e.g. IITD-001 or DU-001"
              value={instituteCode}
              onChange={(e) => setInstituteCode(e.target.value.toUpperCase().trim())}
              disabled={loading}
              className="font-mono text-sm uppercase tracking-wider"
            />
            {fieldErrors.instituteCode ? (
              <p className="text-xs text-rose-600">{fieldErrors.instituteCode}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#475569]" htmlFor="institute-password">
                Password
              </label>
              <Link href="/help" className="text-[11px] text-[#0F172A] font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="institute-password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={institutePassword}
              onChange={(e) => setInstitutePassword(e.target.value)}
              disabled={loading}
            />
            {fieldErrors.password ? (
              <p className="text-xs text-rose-600">{fieldErrors.password}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={loading} size="lg" className="w-full mt-2 font-semibold">
            {loading ? "Verifying..." : "Sign in to Portal →"}
          </Button>

          <div className="pt-2 text-center text-xs text-[#64748B]">
            Need campus onboarding?{" "}
            <Link
              href="/register/institution"
              className="font-semibold text-[#0F172A] hover:underline"
            >
              Bring ManoYug to your campus
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
