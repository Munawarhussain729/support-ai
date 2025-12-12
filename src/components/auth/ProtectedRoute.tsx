"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("client" | "developer")[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles = ["client", "developer"],
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          router.push("/auth/login");
          return;
        }

        const user = JSON.parse(userStr);
        const userRole = user.role;

        // Check if user role is allowed
        if (!allowedRoles.includes(userRole)) {
          // Redirect based on role
          if (userRole === "developer") {
            router.push("/developer");
          } else if (userRole === "client") {
            router.push("/");
          } else {
            router.push("/auth/login");
          }
          return;
        }

        // If redirectTo is specified and user role doesn't match, redirect
        if (redirectTo && userRole !== redirectTo) {
          if (userRole === "developer") {
            router.push("/developer");
          } else {
            router.push("/");
          }
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Error checking auth:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, allowedRoles, redirectTo]);

  if (isLoading) {
    return (
      // biome-ignore lint/correctness/noUnusedVariables: bg-linear-to-br is correct Tailwind syntax
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
