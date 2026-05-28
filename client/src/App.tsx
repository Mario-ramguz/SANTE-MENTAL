import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import MoodTracker from "./pages/MoodTracker";
import Journal from "./pages/Journal";
import Chat from "./pages/Chat";
import Breathing from "./pages/Breathing";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Leaderboard from "./pages/Leaderboard";
import Challenges from "./pages/Challenges";
import ExportProgress from "./pages/ExportProgress";
import RewardsShop from "./pages/RewardsShop";
import DashboardLayout from "./components/DashboardLayout";
import { useAuth } from "./_core/hooks/useAuth";
import { LanguageProvider } from "./contexts/LanguageContext";
import { RewardsProvider } from "./contexts/RewardsContext";

function Router() {
  const { isAuthenticated, loading } = useAuth();

  if (loading || !isAuthenticated) {
    return (
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <RewardsProvider>
      <DashboardLayout>
        <Switch>
          <Route path={"/"} component={Dashboard} />
          <Route path={"/dashboard"} component={Dashboard} />
          <Route path={"/mood"} component={MoodTracker} />
          <Route path={"/journal"} component={Journal} />
          <Route path={"/chat"} component={Chat} />
          <Route path={"/breathing"} component={Breathing} />
          <Route path={"/progress"} component={Progress} />
          <Route path={"/profile"} component={Profile} />
          <Route path={"/settings"} component={Settings} />
          <Route path={"/leaderboard"} component={Leaderboard} />
          <Route path={"/challenges"} component={Challenges} />
          <Route path={"/rewards"} component={RewardsShop} />
          <Route path={"/export"} component={ExportProgress} />
          <Route path={"/404"} component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </DashboardLayout>
    </RewardsProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
