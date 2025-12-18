import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  MessageSquare, 
  Sparkles, 
  Shield, 
  Zap, 
  Globe, 
  ArrowRight
} from "lucide-react";
import { z } from "zod";

// Validation schemas
const emailSchema = z.string().trim().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
  }, [navigate]);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (!isLogin && !fullName.trim()) {
        throw new Error("Please enter your full name");
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ 
          title: "Validation Error", 
          description: error.errors[0].message, 
          variant: "destructive" 
        });
      } else if (error instanceof Error) {
        toast({ 
          title: "Validation Error", 
          description: error.message, 
          variant: "destructive" 
        });
      }
      return false;
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password 
        });
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Email ya password galat hai. Agar account nahi hai to pehle Sign up karein!");
          }
          throw error;
        }
        
        toast({ title: "Swagat hai! 🎉", description: "Successfully logged in" });
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { 
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: fullName.trim() }
          }
        });
        
        if (error) {
          if (error.message.includes("User already registered")) {
            throw new Error("Yeh email pehle se registered hai. Kripya login karein.");
          }
          throw error;
        }
        
        toast({ title: "Account ban gaya! 🎉", description: "Aap ab chat kar sakte hain" });
        navigate("/");
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: "Advanced AI",
      description: "Powered by latest language models"
    },
    {
      icon: Shield,
      title: "Private & Secure",
      description: "Your chats are encrypted"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant responses"
    },
    {
      icon: Globe,
      title: "Multilingual",
      description: "100+ languages supported"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm items-center justify-center p-12 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-2xl animate-pulse delay-500" />
        </div>

        <div className="max-w-lg relative z-10">
          {/* Logo & Title */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/30">
              <MessageSquare className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-foreground">chat.AI</h1>
              <p className="text-muted-foreground text-lg">Aapka Intelligent Assistant</p>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-2xl text-foreground/80 mb-10 leading-relaxed font-light">
            AI conversation ka next generation experience. Kuch bhi puchho, instant intelligent answers pao.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-5 rounded-2xl bg-card/60 border border-border/30 backdrop-blur-sm hover:bg-card/80 hover:scale-105 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-8 border-t border-border/30">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">10M+</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">1B+</p>
              <p className="text-sm text-muted-foreground">Messages</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">99.9%</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/30">
              <MessageSquare className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">chat.AI</h1>
            <p className="text-muted-foreground mt-2">Aapka Intelligent Assistant</p>
          </div>

          {/* Auth Card */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/30 rounded-3xl p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground">
                {isLogin ? "Wapsi Swagat 👋" : "Account Banayein"}
              </h2>
              <p className="text-muted-foreground mt-2">
                {isLogin ? "Continue karne ke liye sign in karein" : "Laakhon users ke saath judein"}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground font-medium">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Aapka naam"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 bg-secondary/50 border-border/50 focus:border-primary rounded-xl transition-all"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="aap@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-secondary/50 border-border/50 focus:border-primary rounded-xl transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-secondary/50 border-border/50 focus:border-primary rounded-xl transition-all"
                />
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <button type="button" className="text-sm text-primary hover:underline">
                    Password bhul gaye?
                  </button>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl transition-all group shadow-lg shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Account Banayein"}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Toggle */}
            <div className="text-center mt-6">
              <p className="text-muted-foreground">
                {isLogin ? "Account nahi hai?" : "Pehle se account hai?"}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-primary font-semibold hover:underline"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Continue karke aap hamare{" "}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {" "}aur{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            {" "}se agree karte hain
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;