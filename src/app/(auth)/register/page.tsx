import { UniversalRegisterView } from "@/components/auth/universal-register-view";

export const metadata = { title: "Register — ManoYug AI" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ accountType?: string }>;
}) {
  const params = await searchParams;
  const initialType = params?.accountType === "institute" ? "institute" : "student";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-8 sm:p-10 shadow-sm">
          <UniversalRegisterView initialType={initialType} />
        </div>
      </div>
    </div>
  );
}
