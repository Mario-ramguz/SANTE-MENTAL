import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Heart, Brain, Wind, BarChart3, MessageCircle, Zap, Loader2, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Home() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"landing" | "login" | "register">("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      navigate("/dashboard");
    },
    onError: (e) => toast.error(e.message),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      navigate("/dashboard");
    },
    onError: (e) => toast.error(e.message),
  });

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const features = [
    { icon: Heart, title: "Suivi de l'humeur", description: "Enregistrez votre état émotionnel quotidien" },
    { icon: Brain, title: "Journal personnel", description: "Écrivez vos pensées dans un espace privé" },
    { icon: MessageCircle, title: "Chatbot IA", description: "Obtenez du soutien émotionnel avec l'IA" },
    { icon: Wind, title: "Exercices de respiration", description: "Techniques de relaxation guidées" },
    { icon: BarChart3, title: "Graphiques de progrès", description: "Visualisez votre bien-être au fil du temps" },
    { icon: Zap, title: "Défis hebdomadaires", description: "Gagnez des points et des récompenses" },
  ];

  if (mode === "login" || mode === "register") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Sérénité</h1>
            <p className="text-muted-foreground mt-2">
              {mode === "login" ? {language === "fr" ? "Connectez-vous à votre compte" : language === "es" ? "Inicia sesión en tu cuenta" : "Sign in to your account"} : {language === "fr" ? "Créez votre compte gratuit" : language === "es" ? "Crea tu cuenta gratis" : "Create your free account"}}
            </p>
          </div>

          <div className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nom</label>
                <Input
                  placeholder={language === "fr" ? "Ton prénom" : language === "es" ? "Tu nombre" : "Your name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "register" ? {language === "fr" ? "Minimum 6 caractères" : language === "es" ? "Mínimo 6 caracteres" : "Minimum 6 characters"} : {language === "fr" ? "Ton mot de passe" : language === "es" ? "Tu contraseña" : "Your password"}}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (mode === "login") loginMutation.mutate({ email, password });
                      else registerMutation.mutate({ email, password, name });
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              className="w-full h-12 text-lg"
              onClick={() => {
                if (mode === "login") loginMutation.mutate({ email, password });
                else registerMutation.mutate({ email, password, name });
              }}
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {loginMutation.isPending || registerMutation.isPending ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Cargando...</>
              ) : mode === "login" ? {language === "fr" ? "Se connecter" : language === "es" ? "Iniciar sesión" : "Sign in"} : {language === "fr" ? "Créer un compte" : language === "es" ? "Crear cuenta" : "Create account"}}
            </Button>
          </div>

          <div className="text-center space-y-2">
            {mode === "login" ? (
              <p className="text-sm text-muted-foreground">
                {language === "fr" ? "Pas encore de compte ?" : language === "es" ? "¿No tenés cuenta?" : "No account yet?"}{" "}
                <button onClick={() => setMode("register")} className="text-primary font-semibold hover:underline">
                  Registrarse
                </button>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {language === "fr" ? "Déjà un compte ?" : language === "es" ? "¿Ya tenés cuenta?" : "Already have an account?"}{" "}
                <button onClick={() => setMode("login")} className="text-primary font-semibold hover:underline">
                  Iniciar sesión
                </button>
              </p>
            )}
            <button onClick={() => setMode("landing")} className="text-sm text-muted-foreground hover:underline block mx-auto">
              ← Volver
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Sérénité</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setMode("login")}>Connexion</Button>
            <Button onClick={() => setMode("register")}>S'inscrire</Button>
          </div>
        </div>
      </nav>

      <section className="container py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Votre compagnon de bien-être mental
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Sérénité vous aide à prendre soin de votre santé mentale avec des outils modernes et bienveillants.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setMode("register")}>Commencer maintenant</Button>
            <Button size="lg" variant="outline" onClick={() => setMode("login")}>Déjà inscrit</Button>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-foreground mb-16">Fonctionnalités principales</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 mt-20">
        <div className="container text-center text-muted-foreground">
          <p>© 2026 Sérénité. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
