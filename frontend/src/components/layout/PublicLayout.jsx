import Navbar from './Navbar';
import Footer from './Footer';
import Chatbot from '../chatbot/Chatbot';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
}
