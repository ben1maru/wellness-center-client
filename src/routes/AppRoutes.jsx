// src/routes/AppRoutes.jsx
import React, { Suspense, lazy } from 'react';
// Видаляємо BrowserRouter as Router звідси
import { Routes, Route, Navigate } from 'react-router-dom';

import LoadingSpinner from '../components/Common/LoadingSpinner.jsx';

// Макети
import PublicLayout from '../components/Layout/PublicLayout.jsx';
import ClientLayout from '../components/Layout/ClientLayout.jsx';
import SpecialistLayout from '../components/Layout/SpecialistLayout.jsx';
import AdminLayout from '../components/Layout/AdminLayout.jsx';

// Компонент для захисту маршрутів
import ProtectedRoute from './ProtectedRoute.jsx';

// --- Ледаче завантаження сторінок ---
// ... (всі ваші імпорти lazy сторінок) ...
const HomePage = lazy(() => import('../pages/public/HomePage.jsx'));
const ServicesPage = lazy(() => import('../pages/public/ServicesPage.jsx'));
const ServiceDetailPage = lazy(() => import('../pages/public/ServiceDetailPage.jsx'));
const SpecialistsPage = lazy(() => import('../pages/public/SpecialistsPage.jsx'));
const SpecialistDetailPagePublic = lazy(() => import('../pages/public/SpecialistDetailPage.jsx'));
const PostsPage = lazy(() => import('../pages/public/PostsPage.jsx'));
const PostDetailPage = lazy(() => import('../pages/public/PostDetailPage.jsx'));
const ContactPage = lazy(() => import('../pages/public/ContactPage.jsx'));
const BookingPage = lazy(() => import('../pages/public/BookingPage.jsx'));
const LoginPage = lazy(() => import('../pages/public/LoginPage.jsx'));
const RegisterPage = lazy(() => import('../pages/public/RegisterPage.jsx'));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage.jsx'));


// Client Pages
const ClientDashboardPage = lazy(() => import('../pages/client/ClientDashboardPage.jsx'));
const MyBookingsPage = lazy(() => import('../pages/client/MyBookingsPage.jsx'));
const ClientProfilePage = lazy(() => import('../pages/client/ClientProfilePage.jsx'));

// Specialist Pages
const SpecialistDashboardPage = lazy(() => import('../pages/specialist/SpecialistDashboardPage.jsx'));
const SpecialistAppointmentsPage = lazy(() => import('../pages/specialist/SpecialistAppointmentsPage.jsx'));
const SpecialistProfilePage = lazy(() => import('../pages/specialist/SpecialistProfilePage.jsx'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage.jsx'));
const AdminAppointmentsPage = lazy(() => import('../pages/admin/AdminAppointmentsPage.jsx'));
const AdminServicesPage = lazy(() => import('../pages/admin/AdminServicesPage.jsx'));
const AdminServiceCategoriesPage = lazy(() => import('../pages/admin/AdminServiceCategoriesPage.jsx'));
const AdminSpecialistsPage = lazy(() => import('../pages/admin/AdminSpecialistsPage.jsx'));
const AdminPostsPage = lazy(() => import('../pages/admin/AdminPostsPage.jsx'));
const AdminPostCategoriesPage = lazy(() => import('../pages/admin/AdminPostCategoriesPage.jsx'));
const AdminReviewsPage = lazy(() => import('../pages/admin/AdminReviewsPage.jsx'));
const AdminContactMessagesPage = lazy(() => import('../pages/admin/AdminContactMessagesPage.jsx'));


const AppRoutes = () => {
  return (
    // <Router> видалено звідси
      <Suspense fallback={<LoadingSpinner sx={{ height: '100vh' }} />}>
        <Routes>
          {/* --- Public Routes --- */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:slug" element={<ServiceDetailPage />} />
            <Route path="/specialists" element={<SpecialistsPage />} />
            <Route path="/specialists/:id" element={<SpecialistDetailPagePublic />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/posts/:slug" element={<PostDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
     
          </Route>

          {/* --- Client Routes (Protected) --- */}
          <Route element={<ProtectedRoute allowedRoles={['client', 'specialist', 'admin']} />}>
            <Route element={<ClientLayout />}>
              <Route path="/client/dashboard" element={<ClientDashboardPage />} />
              <Route path="/client/my-bookings" element={<MyBookingsPage />} />
              <Route path="/client/profile" element={<ClientProfilePage />} />
              <Route path="/client" element={<Navigate to="/client/dashboard" replace />} />
            </Route>
          </Route>

          {/* --- Specialist Routes (Protected) --- */}
          <Route element={<ProtectedRoute allowedRoles={['specialist', 'admin']} />}>
            <Route element={<SpecialistLayout />}>
              <Route path="/specialist/dashboard" element={<SpecialistDashboardPage />} />
              <Route path="/specialist/appointments" element={<SpecialistAppointmentsPage />} />
              <Route path="/specialist/profile" element={<SpecialistProfilePage />} />
              <Route path="/specialist" element={<Navigate to="/specialist/dashboard" replace />} />
            </Route>
          </Route>

          {/* --- Admin Routes (Protected) --- */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
              <Route path="/admin/services" element={<AdminServicesPage />} />
              <Route path="/admin/service-categories" element={<AdminServiceCategoriesPage />} />
              <Route path="/admin/specialists" element={<AdminSpecialistsPage />} />
              <Route path="/admin/posts" element={<AdminPostsPage />} />
              <Route path="/admin/post-categories" element={<AdminPostCategoriesPage />} />
              <Route path="/admin/reviews" element={<AdminReviewsPage />} />
              <Route path="/admin/contact-messages" element={<AdminContactMessagesPage />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    // </Router> видалено звідси
  );
};

export default AppRoutes;