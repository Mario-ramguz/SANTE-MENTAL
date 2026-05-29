import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Heart, Brain, Wind, BarChart3, MessageCircle, Zap, Loader2, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const text = {
  fr: {
    subtitle_register: "Créez votre compte gratuit",
    subtitle_login: "Connectez-vous à votre compte",
    name: "Nom", name_ph: "Ton prénom",
    email: "Email", email_ph: "ton@email.com",
    password: "Mot de passe", password_ph_new: "Minimum 6 caractères", password_ph: "Ton mot de passe",
    loading: "Chargement...", btn_login: "Se connecter", btn_register: "Créer un compte",
    no_account: "Pas encore de compte ?", register_link: "S'inscrire",
    has_account: "Déjà un compte ?", login_link: "Se connecter",
    back: "← Retour", nav_login: "Connexion", nav_register: "S'inscrire",
    hero_title: "Votre compagnon de bien-être mental",
    hero_desc: "Sérénité vous aide à prendre soin de votre santé mentale avec des outils modernes et bienveillants.",
    cta_start: "Commencer maintenant", cta_login: "Déjà inscrit",
    features_title: "Fonctionnalités principales",
    footer: "© 2026 Sérénité. Tous droits réservés.",
  },
  es: {
    subtitle_register: "Crea tu cuenta gratis",
    subtitle_login: "Inicia sesión en tu cuenta",
    name: "Nombre", name_ph: "Tu nombre",
    email: "Email", email_ph: "tu@email.com",
    password: "Contraseña", password_ph_new: "Mínimo 6 caracteres", password_ph: "Tu contraseña",
    loading: "Cargando...", btn_login: "Iniciar sesión", btn_register: "Crear cuenta",
    no_account: "¿No tenés cuenta?", register_link: "Registrarse",
    has_account: "¿Ya tenés cuenta?", login_link: "Iniciar sesión",
    back: "← Volver", nav_login: "Iniciar sesión", nav_register: "Registrarse",
    hero_title: "Tu compañero de bienestar mental",
    hero_desc: "Sérénité te ayuda a cuidar tu salud mental con herramientas modernas y amables.",
    cta_start: "Empezar ahora", cta_login: "Ya tengo cuenta",
    features_title: "Funcionalidades principales",
    footer: "© 2026 Sérénité. Todos los derechos reservados.",
  },
  en: {
    subtitle_register: "Create your free account",
    subtitle_login: "Sign in to your account",
    name: "Name", name_ph: "Your name",
    email: "Email", email_ph: "you@email.com",
    password: "Password", password_ph_new: "Minimum 6 characters", password_ph: "Your password",
    loading: "Loading...", btn_login: "Sign in", btn_register: "Create account",
    no_account: "No account yet?", register_link: "Sign up",
    has_account: "Already have an account?", login_link: "Sign in",
    back: "← Back", nav_login: "Sign in", nav_register: "Sign up",
    hero_title: "Your mental wellness companion",
    hero_desc: "Sérénité helps you take care of your mental health with modern and compassionate tools.",
    cta_start: "Get started", cta_login: "Already registered",
    features_title: "Main features",
    footer: "© 2026 Sérénité. All rights reserved.",
  },
};

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"landing" | "login" | "register">("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const utils = trpc.useUtils();
  const T = text[language as keyof typeof text] ?? text.fr;

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => { utils.auth.me.invalidate(); navigate("/dashboard"); },
    onError: (e) => toast.error(e.message),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => { utils.auth.me.invalidate(); navigate("/dashboard"); },
    onError: (e) => toast.error(e.message),
  });

  if (isAuthenticated) { navigate("/dashboard"); return null; }

  const features = [
    { icon: Heart, title: language === "fr" ? "Suivi de l'humeur" : language === "es" ? "Seguimiento del humor" : "Mood tracking", description: language === "fr" ? "Enregistrez votre état émotionnel quotidien" : language === "es" ? "Registra tu estado emocional diario" : "Track your daily emotional state" },
    { icon: Brain, title: language === "fr" ? "Journal personnel" : language === "es" ? "Diario personal" : "Personal journal", description: language === "fr" ? "Écrivez vos pensées dans un espace privé" : language === "es" ? "Escribe tus pensamientos en un espacio privado" : "Write your thoughts in a private space" },
    { icon: MessageCircle, title: language === "fr" ? "Chatbot IA" : language === "es" ? "Chatbot IA" : "AI Chatbot", description: language === "fr" ? "Obtenez du soutien émotionnel avec l'IA" : language === "es" ? "Obtén apoyo emocional con IA" : "Get emotional support with AI" },
    { icon: Wind, title: language === "fr" ? "Exercices de respiration" : language === "es" ? "Ejercicios de respiración" : "Breathing exercises", description: language === "fr" ? "Techniques de relaxation guidées" : language === "es" ? "Técnicas de relajación guiadas" : "Guided relaxation techniques" },
    { icon: BarChart3, title: language === "fr" ? "Graphiques de progrès" : language === "es" ? "Gráficos de progreso" : "Progress charts", description: language === "fr" ? "Visualisez votre bien-être au fil du temps" : language === "es" ? "Visualiza tu bienestar a lo largo del tiempo" : "Visualize your wellbeing over time" },
    { icon: Zap, title: language === "fr" ? "Défis hebdomadaires" : language === "es" ? "Desafíos semanales" : "Weekly challenges", description: language === "fr" ? "Gagnez des points et des récompenses" : language === "es" ? "Gana puntos y recompensas" : "Earn points and rewards" },
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
              {mode === "login" ? T.subtitle_login : T.subtitle_register}
            </p>
          </div>

          <div className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{T.name}</label>
                <Input placeholder={T.name_ph} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{T.email}</label>
              <Input type="email" placeholder={T.email_ph} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{T.password}</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "register" ? T.password_ph_new : T.password_ph}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (mode === "login") loginMutation.mutate({ email, password });
                      else registerMutation.mutate({ email, password, name });
                    }
                  }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{T.loading}</>
              ) : mode === "login" ? T.btn_login : T.btn_register}
            </Button>
          </div>

          <div className="text-center space-y-2">
            {mode === "login" ? (
              <p className="text-sm text-muted-foreground">
                {T.no_account}{" "}
                <button onClick={() => setMode("register")} className="text-primary font-semibold hover:underline">{T.register_link}</button>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {T.has_account}{" "}
                <button onClick={() => setMode("login")} className="text-primary font-semibold hover:underline">{T.login_link}</button>
              </p>
            )}
            <button onClick={() => setMode("landing")} className="text-sm text-muted-foreground hover:underline block mx-auto">{T.back}</button>
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
            <Button variant="outline" onClick={() => setMode("login")}>{T.nav_login}</Button>
            <Button onClick={() => setMode("register")}>{T.nav_register}</Button>
          </div>
        </div>
      </nav>

      <section className="container py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">{T.hero_title}</h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">{T.hero_desc}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setMode("register")}>{T.cta_start}</Button>
            <Button size="lg" variant="outline" onClick={() => setMode("login")}>{T.cta_login}</Button>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-foreground mb-16">{T.features_title}</h2>
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
          <p>{T.footer}</p>
        </div>
      </footer>
    </div>
  );
}
