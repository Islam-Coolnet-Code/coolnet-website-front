import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminLanguageProvider } from './context/AdminLanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { OrdersPage } from './pages/Orders';
import { OrderDetailPage } from './pages/OrderDetail';
import { PlansPage } from './pages/Plans';
import { PostsPage } from './pages/Posts';
import { ZonesPage } from './pages/Zones';
import { MediaPage } from './pages/Media';
import { PartnersPage } from './pages/Partners';
import { FeaturesPage } from './pages/Features';
import { TestimonialsPage } from './pages/Testimonials';
import { SettingsPage } from './pages/Settings';
import { HomepageLayoutPage } from './pages/HomepageLayout';
import { NavigationPage } from './pages/Navigation';
import { DealersPage } from './pages/Dealers';
import { CitiesPage } from './pages/Cities';

export function AdminRoutes() {
  return (
    <AdminLanguageProvider>
      <AuthProvider>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route index element={<DashboardPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="orders/:id" element={<OrderDetailPage />} />
                    <Route path="plans" element={<PlansPage />} />
                    <Route path="posts" element={<PostsPage />} />
                    <Route path="zones" element={<ZonesPage />} />
                    <Route path="media" element={<MediaPage />} />
                    <Route path="partners" element={<PartnersPage />} />
                    <Route path="features" element={<FeaturesPage />} />
                    <Route path="testimonials" element={<TestimonialsPage />} />
                    <Route path="homepage-layout" element={<HomepageLayoutPage />} />
                    <Route path="navigation" element={<NavigationPage />} />
                  <Route path="dealers" element={<DealersPage />} />
                  <Route path="cities" element={<CitiesPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </AdminLanguageProvider>
  );
}
