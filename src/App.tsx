import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import SplashScreen from "@/components/SplashScreen";
import { useEmotionSensing } from "@/hooks/useEmotionSensing";
import { useRealSensing } from "@/hooks/useRealSensing";
import HomePage from "./pages/HomePage";
import ModesPage from "./pages/ModesPage";
import ShieldPage from "./pages/ShieldPage";
import FocusPage from "./pages/FocusPage";
import CreativePage from "./pages/CreativePage";
import TimelinePage from "./pages/TimelinePage";
import SettingsPage from "./pages/SettingsPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppInner() {
  useEmotionSensing();
  useRealSensing();
  return (
    <>
      <SplashScreen />
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/modes" element={<ModesPage />} />
          <Route path="/shield" element={<ShieldPage />} />
          <Route path="/focus" element={<FocusPage />} />
          <Route path="/creative" element={<CreativePage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
