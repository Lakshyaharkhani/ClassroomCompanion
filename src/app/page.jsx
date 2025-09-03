
"use client";

import { useEffect } from "react";
import LoginPage from "../components/auth/login-page.jsx";
import { useAuth } from "../components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useToast } from "../hooks/use-toast.js";
import Loader from "../components/ui/loader.jsx";


export default function SmartCurriculumApp() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // If user is logged in, redirect to their dashboard
    if (!loading && user) {
       let initialPath = '/';
       if(user.role === 'admin') initialPath = '/admin/dashboard';
       if(user.role === 'staff') initialPath = '/staff/dashboard';
       if(user.role === 'student') initialPath = '/student/dashboard';
       router.replace(initialPath);
    }
  }, [user, loading, router]);

  const handleLogin = async (loginInfo) => {
    try {
        const loggedInUser = await login(loginInfo.email, loginInfo.password);
        let initialPath = '/';
        if (loggedInUser.role === 'admin') {
            initialPath = '/admin/dashboard';
        } else if (loggedInUser.role === 'staff') {
            initialPath = '/staff/dashboard';
        } else if (loggedInUser.role === 'student') {
            initialPath = '/student/dashboard';
        }
        router.push(initialPath);
    } catch(error) {
        console.error("Login failed:", error);
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
        })
    }
  };

  if (loading || user) {
    return (
        <div className="flex flex-col gap-4 justify-center items-center min-h-screen">
            <Loader className="h-12 w-12" />
            <p className="text-muted-foreground">Loading your experience...</p>
        </div>
    )
  }

  return <LoginPage onLogin={handleLogin} />;
}
