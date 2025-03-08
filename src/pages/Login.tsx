
import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function Login() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </ThemeProvider>
  );
}
