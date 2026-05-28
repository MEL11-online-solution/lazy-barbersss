import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { BookingProvider } from './context/BookingContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import WhatsAppButton from './components/common/WhatsAppButton';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BookingProvider>
            <AppRoutes />
            <WhatsAppButton />
          </BookingProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
