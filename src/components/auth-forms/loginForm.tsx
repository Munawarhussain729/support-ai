"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface AuthFormProps {
  title: string;
  buttonText: string;
  isSignUp?: boolean;
}

export default function AuthForm({
  title,
  buttonText,
  isSignUp,
}: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        const response = await fetch("/api/user", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          router.push("/auth/login");
        } else {
          console.error("Failed to submit user");
        }
      } else {
        const response = await fetch(
          "/api/user?email=" + encodeURIComponent(formData.email),
          {
            method: "GET",
          },
        );
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0 && data[0].password === formData.password) {
            localStorage.setItem("user", JSON.stringify(data[0]));
            router.push("/");
          } else {
            console.error("Invalid email or password");
          }
        } else {
          console.error("Failed to fetch user");
        }
      }
    } catch (error) {
      console.error("Failed to submit user");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-semibold">{title}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              onChange={handleChange}
              className="w-full rounded-lg border p-3 outline-none"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            onChange={handleChange}
            className="w-full rounded-lg border p-3 outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
            className="w-full rounded-lg border p-3 outline-none"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-black p-3 text-white transition hover:bg-gray-800"
          >
            {buttonText}
          </button>
        </form>
      </div>
    </div>
  );
}
