"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { registerStudentAction } from "@/lib/auth/actions";
import { submitInstitutionOnboardingRequest } from "@/lib/institution/actions";

export function UniversalRegisterView({
  initialType = "student",
}: {
  initialType?: "student" | "institute";
}) {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"student" | "institute">(initialType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [accountExists, setAccountExists] = useState(false);

  // Student Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instituteCode, setInstituteCode] = useState("");
  const [universityRollNo, setUniversityRollNo] = useState("");
  const [graduationYear, setGraduationYear] = useState(String(new Date().getFullYear() + 2));
  const [password, setPassword] = useState("");

  async function handleStudentRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setAccountExists(false);
    setLoading(true);

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email.trim().toLowerCase());
    formData.append("phone", phone);
    formData.append("instituteCode", instituteCode.trim().toUpperCase());
    formData.append("universityRollNo", universityRollNo.trim());
    formData.append("graduationYear", graduationYear);
    formData.append("password", password);

    try {
      const res = await registerStudentAction(null, formData);
      if (!res.ok) {
        setError(res.message);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        setAccountExists(res.code === "ACCOUNT_EXISTS");
        setLoading(false);
        return;
      }
      router.push(res.redirectTo ?? "/student");
      router.refresh();
    } catch {
      setError("An unexpected error occurred during registration. Please try again.");
      setAccountExists(false);
      setLoading(false);
    }
  }

  async function handleInstitutionSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await submitInstitutionOnboardingRequest(null, formData);
      if (!res.ok) {
        setError(res.message);
        setLoading(false);
        return;
      }
      form.reset();
      setSuccessMessage("Your onboarding request has been received. Our campus partnerships team will reach out to you within 24 hours.");
    } catch {
      setError("An error occurred while submitting your request. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="w-full space-y-7">
      {/* Header */}
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
          {accountType === "student" ? "Create your account" : "Bring ManoYug AI to your campus"}
        </h1>
        <p className="text-xs text-[#64748B]">
          {accountType === "student"
            ? "Connect to your college wellbeing partition with your campus code"
            : "Deploy verified AI companion support and safety telemetry for your students"}
        </p>
      </div>

      {/* Role Toggle */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
        <button
          type="button"
          onClick={() => {
            setAccountType("student");
            setError(null);
            setSuccessMessage(null);
            setFieldErrors({});
            setAccountExists(false);
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
            setSuccessMessage(null);
            setFieldErrors({});
            setAccountExists(false);
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
          {accountExists ? (
            <Link className="ml-1 font-semibold underline underline-offset-2" href="/login/student">
              Sign in
            </Link>
          ) : null}
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert tone="success" role="status">
          {successMessage}
        </Alert>
      ) : null}

      {/* ─── STUDENT REGISTRATION FORM ─── */}
      {accountType === "student" && (
        <form onSubmit={handleStudentRegister} className="space-y-4 my-fade-in-up">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#475569]" htmlFor="student-institute-code">
              College / Institution Code *
            </label>
            <Input
              id="student-institute-code"
              type="text"
              required
              placeholder="e.g. DU-2026 or IITD-001"
              value={instituteCode}
              onChange={(e) => setInstituteCode(e.target.value.toUpperCase().trim())}
              disabled={loading}
              className="font-mono text-sm uppercase tracking-wider"
            />
            {fieldErrors.instituteCode ? (
              <p className="text-xs text-rose-600">{fieldErrors.instituteCode}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#475569]" htmlFor="student-fullname">
                Full Name *
              </label>
              <Input
                id="student-fullname"
                type="text"
                required
                placeholder="Aarav Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
              {fieldErrors.fullName ? (
                <p className="text-xs text-rose-600">{fieldErrors.fullName}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#475569]" htmlFor="student-phone">
                Mobile Number *
              </label>
              <Input
                id="student-phone"
                type="tel"
                required
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
              {fieldErrors.phone ? (
                <p className="text-xs text-rose-600">{fieldErrors.phone}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#475569]" htmlFor="student-email">
              Email Address *
            </label>
            <Input
              id="student-email"
              type="email"
              required
              autoComplete="email"
              placeholder="student@university.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            {fieldErrors.email ? (
              <p className="text-xs text-rose-600">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#475569]" htmlFor="student-roll">
                University Roll Number (optional)
              </label>
              <Input
                id="student-roll"
                type="text"
                placeholder="e.g. 21BCE1042"
                value={universityRollNo}
                onChange={(e) => setUniversityRollNo(e.target.value)}
                disabled={loading}
              />
              {fieldErrors.universityRollNo ? (
                <p className="text-xs text-rose-600">{fieldErrors.universityRollNo}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#475569]" htmlFor="student-grad-year">
                Graduation Year *
              </label>
              <Input
                id="student-grad-year"
                type="number"
                required
                min={2020}
                max={2035}
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                disabled={loading}
              />
              {fieldErrors.graduationYear ? (
                <p className="text-xs text-rose-600">{fieldErrors.graduationYear}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#475569]" htmlFor="student-password">
              Password *
            </label>
            <Input
              id="student-password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {fieldErrors.password ? (
              <p className="text-xs text-rose-600">{fieldErrors.password}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={loading} size="lg" className="w-full mt-2 font-semibold">
            {loading ? "Creating Account..." : "Create Account →"}
          </Button>

          <div className="pt-2 text-center text-xs text-[#64748B]">
            Already have an account?{" "}
            <Link
              href="/login/student"
              className="font-semibold text-[#0F172A] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </form>
      )}

      {/* ─── INSTITUTION REQUEST FORM ─── */}
      {accountType === "institute" && (
        <form onSubmit={handleInstitutionSubmit} className="space-y-4 my-fade-in-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#475569]" htmlFor="inst-name">
                Institution Name *
              </label>
              <Input
                id="inst-name"
                name="institutionName"
                type="text"
                required
                placeholder="e.g. Delhi University"
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#475569]" htmlFor="inst-type">
                Institution Type *
              </label>
              <select
                id="inst-type"
                name="institutionType"
                required
                disabled={loading}
                className="w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm text-[#0F172A] shadow-xs focus:border-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/10 disabled:opacity-50"
              >
                <option value="University">University</option>
                <option value="College">College</option>
                <option value="Institute">Institute</option>
                <option value="Coaching Center">Coaching Center</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#475569]" htmlFor="contact-person">
                Contact Person *
              </label>
              <Input
                id="contact-person"
                name="contactPersonName"
                type="text"
                required
                placeholder="Dr. Rajesh Kumar"
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#475569]" htmlFor="contact-designation">
                Designation *
              </label>
              <Input
                id="contact-designation"
                name="contactPersonDesignation"
                type="text"
                required
                placeholder="Dean of Student Affairs"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#475569]" htmlFor="inst-email">
                Official Email *
              </label>
              <Input
                id="inst-email"
                name="officialEmail"
                type="email"
                required
                placeholder="dean.students@univ.ac.in"
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#475569]" htmlFor="inst-phone">
                Phone Number *
              </label>
              <Input
                id="inst-phone"
                name="contactPhone"
                type="tel"
                required
                placeholder="+91 9876543210"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#475569]" htmlFor="inst-city">
                City *
              </label>
              <Input id="inst-city" name="city" type="text" required placeholder="New Delhi" disabled={loading} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#475569]" htmlFor="inst-state">
                State *
              </label>
              <Input id="inst-state" name="state" type="text" required placeholder="Delhi" disabled={loading} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#475569]" htmlFor="inst-students">
                Student Count
              </label>
              <Input
                id="inst-students"
                name="approximateStudentCount"
                type="number"
                placeholder="5000"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#475569]" htmlFor="inst-message">
              Message / Campus Requirements
            </label>
            <Textarea
              id="inst-message"
              name="notes"
              placeholder="Tell us about your campus size, hostel requirements, or existing counseling setups..."
              disabled={loading}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} size="lg" className="w-full mt-2 font-semibold">
            {loading ? "Submitting Request..." : "Request a conversation →"}
          </Button>

          <div className="pt-2 text-center text-xs text-[#64748B]">
            Already provisioned?{" "}
            <Link
              href="/login/institution"
              className="font-semibold text-[#0F172A] hover:underline"
            >
              Sign in to Portal
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
