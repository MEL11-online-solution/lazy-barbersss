import { Route, Switch, Redirect } from 'wouter';
import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/common/Spinner';

import HomePage from '../pages/public/HomePage';
import ServicesPage from '../pages/public/ServicesPage';
import GalleryPage from '../pages/public/GalleryPage';
import ReviewsPage from '../pages/public/ReviewsPage';
import TeamPage from '../pages/public/TeamPage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';
import NotFoundPage from '../pages/public/NotFoundPage';

import SignInPage from '../pages/auth/SignInPage';
import SignUpPage from '../pages/auth/SignUpPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

import BookingFlowPage from '../pages/booking/BookingFlowPage';
import BookingConfirmationPage from '../pages/booking/BookingConfirmationPage';
import ReceiptPage from '../pages/booking/ReceiptPage';

import MyBookingsPage from '../pages/customer/MyBookingsPage';
import ProfilePage from '../pages/customer/ProfilePage';

import BarberDashboardPage from '../pages/barber/BarberDashboardPage';
import BarberTimeOffPage from '../pages/barber/BarberTimeOffPage';

import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminSchedulePage from '../pages/admin/AdminSchedulePage';
import AdminServicesPage from '../pages/admin/AdminServicesPage';
import AdminCustomersPage from '../pages/admin/AdminCustomersPage';
import AdminRevenuePage from '../pages/admin/AdminRevenuePage';
import AdminBarbersPage from '../pages/admin/AdminBarbersPage';
import AdminContactPage from '../pages/admin/AdminContactPage';
import AdminAuditLogPage from '../pages/admin/AdminAuditLogPage';
import AdminClubMembersPage from '../pages/admin/AdminClubMembersPage';

function withPublic(Component) {
  return (params) => (
    <PublicLayout>
      <Component {...params} />
    </PublicLayout>
  );
}

function withProtectedDash(Component, role) {
  return (params) => (
    <ProtectedRoute roles={[role]}>
      <DashboardLayout role={role}>
        <Component {...params} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function withProtectedPublic(Component, roles) {
  return (params) => (
    <ProtectedRoute roles={roles}>
      <PublicLayout>
        <Component {...params} />
      </PublicLayout>
    </ProtectedRoute>
  );
}

function RootRoute() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Redirect to="/sign-in" />;
  return (
    <PublicLayout>
      <HomePage />
    </PublicLayout>
  );
}

export default function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={RootRoute} />
      <Route path="/home" component={withPublic(HomePage)} />
      <Route path="/services" component={withPublic(ServicesPage)} />
      <Route path="/gallery" component={withPublic(GalleryPage)} />
      <Route path="/reviews" component={withPublic(ReviewsPage)} />
      <Route path="/team" component={withPublic(TeamPage)} />
      <Route path="/about" component={withPublic(AboutPage)} />
      <Route path="/contact" component={withPublic(ContactPage)} />
      <Route path="/sign-in" component={withPublic(SignInPage)} />
      <Route path="/sign-up" component={withPublic(SignUpPage)} />
      <Route path="/verify-email" component={withPublic(VerifyEmailPage)} />
      <Route path="/forgot-password" component={withPublic(ForgotPasswordPage)} />
      <Route path="/booking" component={withProtectedPublic(BookingFlowPage, ['customer', 'admin'])} />
      <Route path="/booking/confirmation/:id" component={withProtectedPublic(BookingConfirmationPage, ['customer', 'admin'])} />
      <Route path="/booking/receipt/:id" component={withProtectedPublic(ReceiptPage, ['customer', 'admin', 'barber'])} />
      <Route path="/my-bookings" component={withProtectedPublic(MyBookingsPage, ['customer'])} />
      <Route path="/profile" component={withProtectedPublic(ProfilePage, ['customer', 'barber', 'admin'])} />
      <Route path="/barber" component={withProtectedDash(BarberDashboardPage, 'barber')} />
      <Route path="/barber/time-off" component={withProtectedDash(BarberTimeOffPage, 'barber')} />
      <Route path="/admin" component={withProtectedDash(AdminDashboardPage, 'admin')} />
      <Route path="/admin/schedule" component={withProtectedDash(AdminSchedulePage, 'admin')} />
      <Route path="/admin/services" component={withProtectedDash(AdminServicesPage, 'admin')} />
      <Route path="/admin/customers" component={withProtectedDash(AdminCustomersPage, 'admin')} />
      <Route path="/admin/revenue" component={withProtectedDash(AdminRevenuePage, 'admin')} />
      <Route path="/admin/barbers" component={withProtectedDash(AdminBarbersPage, 'admin')} />
      <Route path="/admin/contact" component={withProtectedDash(AdminContactPage, 'admin')} />
      <Route path="/admin/club-members" component={withProtectedDash(AdminClubMembersPage, 'admin')} />
      <Route path="/admin/audit-logs" component={withProtectedDash(AdminAuditLogPage, 'admin')} />
      <Route component={withPublic(NotFoundPage)} />
    </Switch>
  );
}
