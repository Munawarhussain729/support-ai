import AuthForm from "@/components/auth-forms/loginForm";

export default function page() {
  return (
    <AuthForm
      title="Login to Your Account"
      buttonText="Login"
      isSignUp={false}
    />
  );
}
