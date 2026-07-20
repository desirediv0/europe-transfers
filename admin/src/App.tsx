import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Sidebar, AdminHeader } from "@/components/layout/Sidebar";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import LocationsPage from "@/pages/LocationsPage";
import CarTypesPage from "@/pages/CarTypesPage";
import RoutesPage from "@/pages/RoutesPage";
import RoutePricesPage from "@/pages/RoutePricesPage";
import PackagesPage from "@/pages/PackagesPage";
import BookingsPage from "@/pages/BookingsPage";
import UsersPage from "@/pages/UsersPage";
import TestimonialsPage from "@/pages/TestimonialsPage";
import UploadsPage from "@/pages/UploadsPage";

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:ml-60 transition-all duration-300">
        <AdminHeader />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/locations" element={<LocationsPage />} />
                    <Route path="/car-types" element={<CarTypesPage />} />
                    <Route path="/routes" element={<RoutesPage />} />
                    <Route path="/route-prices" element={<RoutePricesPage />} />
                    <Route path="/packages" element={<PackagesPage />} />
                    <Route path="/bookings" element={<BookingsPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/testimonials" element={<TestimonialsPage />} />
                    <Route path="/uploads" element={<UploadsPage />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
