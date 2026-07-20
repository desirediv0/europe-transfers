import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully");
      navigate("/", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      {/* Background Image with Dark Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src="/login_bg.png"
          alt="Luxury travel background"
          className="w-full h-full object-cover scale-105 filter blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0F1A2E] via-[#0F1A2E]/90 to-transparent" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Decorative Glow Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-[#C9A227]/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-[#1B2A4A]/50 blur-3xl" />
      </div>

      <Card className="relative z-10 w-full max-w-md bg-[#0F1A2E]/75 backdrop-blur-xl border border-white/10 shadow-2xl text-white rounded-2xl p-2">
        <CardHeader className="text-center pt-8 pb-4">
          {/* Logo container */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-xl px-5 py-3 shadow-md hover:scale-[1.03] transition-transform duration-300">
              <img
                src="/logo.png"
                alt="The Europe Transfers Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-white/50 text-sm mt-1">
            Admin Dashboard Secure Login
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80 font-medium text-xs uppercase tracking-wider">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@europetransfers.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#C9A227]/50 focus:ring-[#C9A227]/50 rounded-xl h-11 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80 font-medium text-xs uppercase tracking-wider">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#C9A227]/50 focus:ring-[#C9A227]/50 rounded-xl h-11 pr-10 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#C9A227] hover:bg-[#d4b44a] text-navy font-semibold rounded-xl h-11 shadow-lg shadow-[#C9A227]/10 hover:shadow-[#C9A227]/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 mt-2"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In to Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
