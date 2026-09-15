import Link from "next/link";
import { OtpForm } from "@/components/auth/otp-form";
import { Alert } from "@/components/ui/alert";

export const metadata = { title: "Verify email — ManoYug AI" };

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = (params.email ?? "").trim().toLowerCase();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-[#E2E8F0] bg-white p-8 sm:p-10 shadow-sm text-center">
        <div>
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-[#0F172A] text-white font-bold text-xl mb-4 shadow-xs">
            M
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] font-display">
            Verify your student profile
          </h2>
          <p className="mt-2 text-xs text-[#64748B] leading-relaxed">
            Enter the verification code sent to your approved student email to continue.
          </p>
        </div>

        {!email ? (
          <Alert tone="warning" title="Email missing">
            Start from{" "}
            <Link href="/register" className="font-semibold underline">
              registration
            </Link>{" "}
            so we know which student account to verify.
          </Alert>
        ) : (
          <div className="space-y-4">
            <OtpForm email={email} />
          </div>
        )}

        <div className="pt-2">
          <Link href="/login" className="text-xs font-semibold text-[#0F172A] hover:underline">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
