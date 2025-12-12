import AuthForm from "@/components/auth-forms/loginForm";

export default function page() {
  return (
    <AuthForm
      title="Create Your Account"
      buttonText="Sign Up"
      isSignUp={true}
    />
  );
}
