import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import NotFound from "@/pages/NotFound";

// Kalau nanti bikin halaman baru, import di sini:
// import About from "./pages/About";
// import Members from "./pages/Members";
import Event from  "./pages/Event";
import Bracket from  "./pages/Bracket";
import Miniapp from  "./pages/miniapp/Miniapp";



function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Contoh halaman lain */}
            {/* <Route path="/about" element={<About />} /> */}
            {/* <Route path="/members" element={<Members />} /> */}
            <Route path="/event" element={<Event />} />
            <Route path="/bracket" element={<Bracket />} />
            <Route path="/miniapp" element={<Miniapp />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
