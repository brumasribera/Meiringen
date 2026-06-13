import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/LoginForm";
import { getAuthProviders } from "@/lib/auth-providers";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { error, next } = await searchParams;
  setRequestLocale(locale);
  const providers = await getAuthProviders();

  return (
    <div className="px-4 py-12">
      <LoginForm
        googleEnabled={providers.google}
        useCustomGoogle={providers.useCustomGoogle}
        authError={error ? decodeURIComponent(error) : undefined}
        next={next ? decodeURIComponent(next) : undefined}
      />
    </div>
  );
}
