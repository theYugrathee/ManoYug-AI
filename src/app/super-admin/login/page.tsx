import Link from "next/link";
import { SuperAdminLoginView } from "@/components/auth/super-admin-login-view";

export const metadata = { title: "Platform administrator sign in" };

export default function SuperAdminLoginPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-sm sm:p-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#0F172A] hover:underline"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F172A] text-white">M</span> ManoYug</Link>
        <h1 className="mt-8 font-display text-3xl font-extrabold tracking-tight text-[#0F172A]">Platform console</h1>
        <p className="mt-2 text-sm leading-6 text-[#64748B]">Use your approved platform administrator account. Institution and student accounts cannot access this area.</p>
        <div className="mt-8"><SuperAdminLoginView /></div>
      </div>
    </main>
  );
}
