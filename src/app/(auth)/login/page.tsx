import { UniversalLoginView } from "@/components/auth/universal-login-view";

export const metadata = { title: "Sign in — ManoYug AI" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; accountType?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith("/") ? params.next : "/student";
  const initialType = params.accountType === "institute" ? "institute" : "student";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-8 sm:p-10 shadow-sm">
          <UniversalLoginView initialType={initialType} nextPath={nextPath} />
        </div>
      </div>
    </div>
  );
}
