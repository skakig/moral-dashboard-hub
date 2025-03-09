import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        toast("Login successful", {
          description: "Welcome to TMH Admin Dashboard",
        });
        navigate("/");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    if (!email) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setResetSent(true);
        toast("Password reset email sent", {
          description: "Check your inbox for instructions to reset your password",
        });
      }
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError("An error occurred sending the reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-center mb-5">
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-card"></div>
          </div>
        </div>
        <CardTitle className="text-2xl text-center">TMH Admin Login</CardTitle>
        <CardDescription className="text-center">
          {isResetMode
            ? "Enter your email to receive a password reset link"
            : "Enter your credentials to access the admin dashboard"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {resetSent ? (
          <div className="text-center">
            <p className="mb-4">Password reset email sent to {email}.</p>
            <p className="mb-4">Please check your inbox and follow the instructions.</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={() => {
                setIsResetMode(false);
                setResetSent(false);
              }}
            >
              Return to login
            </Button>
          </div>
        ) : (
          <form onSubmit={isResetMode ? handleResetPassword : handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              {!isResetMode && (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <CardFooter className="flex flex-col px-0 pt-4">
                <Button type="submit" className="w-full mb-2" disabled={isLoading}>
                  {isLoading 
                    ? (isResetMode ? "Sending..." : "Logging in...") 
                    : (isResetMode ? "Send Reset Link" : "Login")}
                </Button>
                <Button 
                  type="button" 
                  variant="link" 
                  className="w-full text-sm"
                  onClick={() => setIsResetMode(!isResetMode)}
                >
                  {isResetMode ? "Back to Login" : "Forgot Password?"}
                </Button>
              </CardFooter>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
