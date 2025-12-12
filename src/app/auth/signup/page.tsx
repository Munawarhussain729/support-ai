"use client";

import AuthForm from "@/components/auth-forms/loginForm";
import { useTranslations } from "next-intl";

export default function page() {
  const t = useTranslations();
  return (
    <AuthForm
      title={t("auth.signupTitle")}
      buttonText={t("auth.signupButton")}
      isSignUp={true}
    />
  );
}
