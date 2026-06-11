import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/LoginForm";

type Props = { params: Promise<{ locale: string }> };

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="px-4 py-12">
      <LoginForm />
    </div>
  );
}
