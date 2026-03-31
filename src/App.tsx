
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Header from "@/components/Header/index";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "@/components/ui/scroll-to-top";
import { Loader2 } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NewLine = lazy(() => import("./pages/order/NewLine"));
const HomServices = lazy(() => import("@/pages/home-services/HomServices"));
const Dealers = lazy(() => import("./pages/dealers/Dealers"));
const SpeedTest = lazy(() => import("./pages/SpeedTest"));
const Qrcodepromotion = lazy(() => import("./pages/qrcodepromotion/Qrcodepromotion"));
const Login = lazy(() => import("./pages/CustomerCorner/Login"));
const Dashboard = lazy(() => import("./pages/CustomerCorner/Dashboard"));
const AllPlans = lazy(() => import("./pages/AllPlans"));
const AllNews = lazy(() => import("./pages/AllNews"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const AllServices = lazy(() => import("./pages/AllServices"));
const ActivateService = lazy(() => import("./pages/ActivateService"));

// Admin panel
const AdminRoutes = lazy(() => import("./admin").then(m => ({ default: m.AdminRoutes })));

// Configure QueryClient with caching for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      gcTime: 30 * 60 * 1000, // Cache for 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't refetch when component remounts if data is fresh
      retry: 1, // Only retry failed requests once
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <Loader2 className="w-12 h-12 animate-spin text-coolnet-purple" />
  </div>
);

const ConditionalHeader = () => {
  const location = useLocation();

  // Hide header for QR promotion routes, customer corner routes, and admin routes
  if (location.pathname.startsWith('/qrpromotion') || location.pathname.startsWith('/customer-corner') || location.pathname.startsWith('/admin')) {
    return null;
  }

  return <Header />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <LanguageProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ConditionalHeader />
                <ScrollToTop />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/new-line" element={<NewLine />} />
                    <Route path="/dealers" element={<Dealers />} />
                    <Route path="/site/get-dealers" element={<Dealers />} />
                    <Route path="/home-services" element={<HomServices />} />
                    <Route path="/speed-test" element={<SpeedTest />} />
                    <Route path="/plans" element={<AllPlans />} />
                    <Route path="/news" element={<AllNews />} />
                    <Route path="/news/:slug" element={<PostDetail />} />
                    <Route path="/services" element={<AllServices />} />
                    <Route path="/activate-service" element={<ActivateService />} />
                    <Route path="/activate-service/:referenceNumber" element={<ActivateService />} />
                    <Route path="/qrpromotion" element={<Qrcodepromotion />} />
                    <Route path="/qrpromotion/:referrer" element={<Qrcodepromotion />} />
                    {/* Customer Corner Routes */}
                    <Route path="/customer-corner" element={<Login />} />
                    <Route
                      path="/customer-corner/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    {/* Admin Panel */}
                    <Route path="/admin/*" element={<AdminRoutes />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </AuthProvider>
          </LanguageProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
