
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { GraduationCap, LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth } from "./auth-provider";
import { useToast } from "../../hooks/use-toast";

export default function LoginPage({ onLogin }) {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("student0@example.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleLogin = () => {
    if (email.trim() && password.trim()) {
      onLogin({ email: email.trim(), password });
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'staff') {
      setEmail('staff0@example.com');
    } else if (newRole === 'admin') {
      setEmail('admin@example.com');
    } else {
      setEmail('student0@example.com');
    }
    setPassword("");
  }

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email is required",
        description: "Please enter your email address to reset your password.",
      });
      return;
    }
    try {
      await resetPassword(email);
      toast({
        title: "Password Reset Email Sent",
        description: `If an account exists for ${email}, a password reset link has been sent to it.`,
      });
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not send password reset email. Please try again.",
      });
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-background px-4">
       <div className="container absolute top-0 left-0 right-0 flex items-center gap-3 p-6">
         <GraduationCap className="h-8 w-8 text-primary" />
         <span className="text-xl font-bold">Classroom Companion</span>
      </div>
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">Please select your role and login to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
             <Label>Role</Label>
            <div className="flex gap-2">
              {(["student", "staff", "admin"]).map((r) => (
                <Button
                  key={r}
                  variant={role === r ? "default" : "outline"}
                  onClick={() => handleRoleChange(r)}
                  className="capitalize flex-1"
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button variant="link" className="h-auto p-0 text-xs" onClick={handlePasswordReset}>
                Forgot password?
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>
          <Button onClick={handleLogin} className="w-full" size="lg">
            <LogIn className="mr-2 h-4 w-4" /> Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
