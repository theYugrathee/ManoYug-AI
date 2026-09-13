import { RoleSelector } from "@/components/auth/role-selector";

export const metadata = {
  title: "Get Started — ManoYug AI",
  description: "Choose how you'd like to use ManoYug AI — as a student or an institution.",
};

export default function GetStartedPage() {
  return <RoleSelector />;
}
