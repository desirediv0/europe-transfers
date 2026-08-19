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
import VanCoachPage from "@/pages/VanCoachPage";
import PrivateTransfersPage from "@/pages/PrivateTransfersPage";
import RoutesPage from "@/pages/RoutesPage";
import PackagesPage from "@/pages/PackagesPage";
import SightseeingPage from "@/pages/SightseeingPage";
import BookingsPage from "@/pages/BookingsPage";
import SightseeingOrdersPage from "@/pages/SightseeingOrdersPage";
import FleetOrdersPage from "@/pages/FleetOrdersPage";
import UsersPage from "@/pages/UsersPage";
import TestimonialsPage from "@/pages/TestimonialsPage";
import UploadsPage from "@/pages/UploadsPage";

// SEO & Blog Pages
import SeoPagesPage from "@/pages/SeoPagesPage";
import SeoPageFormPage from "@/pages/SeoPageFormPage";
import BlogCategoriesPage from "@/pages/BlogCategoriesPage";
import BlogCategoryFormPage from "@/pages/BlogCategoryFormPage";
import BlogTagsPage from "@/pages/BlogTagsPage";
import BlogTagFormPage from "@/pages/BlogTagFormPage";
import BlogPostsPage from "@/pages/BlogPostsPage";
import BlogPostFormPage from "@/pages/BlogPostFormPage";

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
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DataProvider>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      
                      {/* SEO Dynamic Pages */}
                      <Route path="/seo-pages" element={<SeoPagesPage />} />
                      <Route path="/seo-pages/new" element={<SeoPageFormPage />} />
                      <Route path="/seo-pages/edit/:id" element={<SeoPageFormPage />} />

                      {/* Blog System */}
                      <Route path="/blog/posts" element={<BlogPostsPage />} />
                      <Route path="/blog/posts/new" element={<BlogPostFormPage />} />
                      <Route path="/blog/posts/edit/:id" element={<BlogPostFormPage />} />

                      <Route path="/blog/categories" element={<BlogCategoriesPage />} />
                      <Route path="/blog/categories/new" element={<BlogCategoryFormPage />} />
                      <Route path="/blog/categories/edit/:id" element={<BlogCategoryFormPage />} />

                      <Route path="/blog/tags" element={<BlogTagsPage />} />
                      <Route path="/blog/tags/new" element={<BlogTagFormPage />} />
                      <Route path="/blog/tags/edit/:id" element={<BlogTagFormPage />} />

                      <Route path="/locations" element={<LocationsPage />} />
                      <Route path="/car-types" element={<CarTypesPage />} />
                      <Route path="/van-coach" element={<VanCoachPage />} />
                      <Route path="/private-transfers" element={<PrivateTransfersPage />} />
                      <Route path="/routes" element={<RoutesPage />} />
                      <Route path="/packages" element={<PackagesPage />} />
                      <Route path="/sightseeing" element={<SightseeingPage />} />
                      <Route path="/bookings" element={<BookingsPage />} />
                      <Route path="/sightseeing-orders" element={<SightseeingOrdersPage />} />
                      <Route path="/fleet-orders" element={<FleetOrdersPage />} />
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/testimonials" element={<TestimonialsPage />} />
                      <Route path="/uploads" element={<UploadsPage />} />
                    </Routes>
                  </AdminLayout>
                </DataProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
