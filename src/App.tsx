import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import UniversalDigitizer from "./pages/UniversalDigitizer";
import TableDigitizer from "./pages/TableDigitizer";
import Dashboard from "./pages/Dashboard";
import CasinoDashboard from "./pages/CasinoDashboard";
import DeltinCasino from "./pages/DeltinCasino";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DeltinCasino />} />
          <Route path="/universal" element={<UniversalDigitizer />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/casino-dashboard" element={<CasinoDashboard />} />
          <Route path="/deltin-casino" element={<DeltinCasino />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
