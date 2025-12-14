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
  ArrowRight,
  Crown,
  Check,
  Copy,
  QrCode
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
  const [showPayment, setShowPayment] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const UPI_ID = "9622930781@ybl";

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
            throw new Error("Galat email ya password. Kripya check karein.");
          }
          throw error;
        }
        
        toast({ title: "Swagat hai! 🎉", description: "Successfully logged in" });
        navigate("/");
      } else {
        // Check if user already exists
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

  const copyUPI = async () => {
    await navigator.clipboard.writeText(UPI_ID);
    setUpiCopied(true);
    toast({ title: "Copied!", description: "UPI ID copied to clipboard" });
    setTimeout(() => setUpiCopied(false), 2000);
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

  const premiumFeatures = [
    "Unlimited AI conversations",
    "Priority fast responses",
    "Voice chat feature",
    "No ads or interruptions",
    "Premium support 24/7"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex">
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
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/30 animate-pulse">
              <MessageSquare className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">chat.AI</h1>
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
                className="p-5 rounded-2xl bg-background/60 border border-border/30 backdrop-blur-sm hover:bg-background/80 hover:scale-105 transition-all duration-300 group"
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

          {!showPayment ? (
            /* Auth Card */
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
                      className="h-12 bg-background/50 border-border/50 focus:border-primary rounded-xl transition-all"
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
                    className="h-12 bg-background/50 border-border/50 focus:border-primary rounded-xl transition-all"
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
                    className="h-12 bg-background/50 border-border/50 focus:border-primary rounded-xl transition-all"
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

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/30" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card/80 text-muted-foreground">ya</span>
                </div>
              </div>

              {/* Premium Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPayment(true)}
                className="w-full h-12 text-base font-semibold border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-600 dark:text-amber-400 rounded-xl transition-all group"
              >
                <Crown className="w-5 h-5 mr-2" />
                Premium Plan Lein
                <Sparkles className="w-4 h-4 ml-2 group-hover:animate-pulse" />
              </Button>

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
          ) : (
            /* Payment Card */
            <div className="bg-card/80 backdrop-blur-xl border border-border/30 rounded-3xl p-8 shadow-2xl">
              <button 
                onClick={() => setShowPayment(false)}
                className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-2"
              >
                ← Wapas jayein
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Premium Plan</h2>
                <p className="text-muted-foreground mt-1">Unlimited AI experience</p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-foreground">₹99</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* UPI Payment */}
              <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">UPI se Pay karein</p>
                    <p className="text-sm text-muted-foreground">Paytm, PhonePe, Google Pay</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-background/80 rounded-xl p-3 border border-border/50">
                  <span className="flex-1 font-mono text-foreground text-lg">{UPI_ID}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={copyUPI}
                    className="h-8 px-3"
                  >
                    {upiCopied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Payment ke baad apna transaction ID save karein
                </p>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-6">
                Payment verify hone ke baad aapko premium access mil jayega
              </p>
            </div>
          )}

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