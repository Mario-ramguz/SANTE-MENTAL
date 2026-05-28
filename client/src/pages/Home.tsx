import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Heart, Brain, Zap, BarChart3, MessageCircle, Wind } from "lucide-react";
import { useLocation } from "wouter";
import { MoodChart } from "@/components/MoodChart";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const features = [
    {
      icon: Heart,
      title: "Suivi de l'humeur",
      description: "Enregistrez votre état émotionnel quotidien avec des sélecteurs visuels intuitifs",
    },
    {
      icon: Brain,
      title: "Journal personnel",
      description: "Écrivez vos pensées et réflexions dans un espace sûr et privé",
    },
    {
      icon: MessageCircle,
      title: "Chatbot IA",
      description: "Obtenez du soutien émotionnel grâce à notre assistant IA bienveillant",
    },
    {
      icon: Wind,
      title: "Exercices de respiration",
      description: "Guidez-vous à travers des techniques de relaxation et de pleine conscience",
    },
    {
      icon: BarChart3,
      title: "Graphiques de progrès",
      description: "Visualisez votre bien-être au fil du temps avec des analyses détaillées",
    },
    {
      icon: Zap,
      title: "Notifications",
      description: "Recevez des rappels personnalisés pour maintenir votre routine",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Sérénité</span>
          </div>
          <Button asChild>
            <a href={getLoginUrl()}>Connexion</a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Votre compagnon de bien-être mental
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Sérénité vous aide à prendre soin de votre santé mentale avec des outils modernes, intuitifs et bienveillants. Suivez votre humeur, écrivez votre journal et recevez du soutien IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href={getLoginUrl()}>Commencer maintenant</a>
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              En savoir plus
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-foreground mb-16">
            Fonctionnalités principales
          </h2>
          
          {/* Gráfico de progreso si el usuario está autenticado */}
          {isAuthenticated && (
            <div className="mb-12">
              <MoodChart />
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="max-w-2xl mx-auto text-center p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Prêt à commencer votre voyage vers le bien-être?
          </h2>
          <p className="text-muted-foreground mb-6">
            Rejoignez des milliers d'utilisateurs qui transforment leur santé mentale avec Sérénité.
          </p>
          <Button size="lg" asChild>
            <a href={getLoginUrl()}>S'inscrire gratuitement</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-20">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2026 Sérénité. Tous droits réservés.</p>
          <p className="text-sm mt-2">
            Sérénité est une application de bien-être mental. Pour les urgences, contactez les services d'urgence.
          </p>
        </div>
      </footer>
    </div>
  );
}
