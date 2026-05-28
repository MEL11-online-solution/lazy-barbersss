import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { contactApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const schema = z.object({
  full_name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().toLowerCase().email('Invalid email'),
  phone: z.string().trim().regex(/^\+?[0-9\s\-()]{6,20}$/u, 'Invalid phone').optional().or(z.literal('')),
  subject: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(1, 'Message is required').max(5000),
});

const FAQS = [
  { q: 'What are your opening hours?', a: 'We are open 7 days a week, Monday to Sunday, from 9 am to 7 pm at both our Granville and Campsie locations.' },
  { q: 'Do I need to book in advance?', a: 'Walk-ins are always welcome, but we recommend booking in advance to secure your preferred time slot — especially on weekends.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, cash, and Apple Pay. Online bookings are processed securely via Stripe.' },
  { q: 'Can I cancel or reschedule my booking?', a: 'Yes, you can cancel or reschedule up to 24 hours before your appointment at no charge. Late cancellations may forfeit any deposit.' },
  { q: 'Do you offer kids haircuts?', a: 'Yes! We offer kids haircuts starting from $30. Our barbers are experienced with all ages and will make sure your little one feels comfortable.' },
  { q: 'Where are you located?', a: 'We have two locations: 15 Good St, Granville NSW 2142 (5 min from Granville Station) and 62 Beamish St, Campsie NSW 2194 (near Campsie Station).' },
];

export default function ContactPage() {
  const toast = useToast();
  const mapRef = useScrollReveal();
  const formRef = useScrollReveal(100);
  const faqRef = useScrollReveal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    try {
      await contactApi.send(values);
      toast.success("Message sent — we'll be in touch shortly.");
      reset();
    } catch (e) {
      toast.error(e.message || 'Failed to send message');
    }
  }

  return (
    <>
      <section className="section text-center">
        <div className="container-page">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="h-px w-8 bg-gold-400 inline-block" />
            <span className="text-gold-400 text-xs tracking-widest uppercase font-display">Get in touch</span>
            <span className="h-px w-8 bg-gold-400 inline-block" />
          </div>
          <h1 className="h-display">Contact Us</h1>
          <p className="mt-3 max-w-xl mx-auto" style={{ color: 'var(--lb-text-muted)' }}>
            We'd love to hear from you. Contact us today to book your appointment or ask any questions.
          </p>
        </div>
      </section>

      <section className="container-page pb-24 space-y-8">
        {/* Map — full width on top */}
        <div ref={mapRef}>
          <div
            className="w-full rounded-xl overflow-hidden"
            style={{ height: '350px', border: '1px solid var(--lb-border)' }}
          >
            <iframe
              title="Lazy Barbers location"
              src="https://maps.google.com/maps?q=15+Good+Street+Granville+NSW+2142+Australia&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="text-center mt-3">
            <a
              href="https://maps.app.goo.gl/KG1Fztvt5dPKEoS88"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-pink-500 hover:text-pink-400 underline underline-offset-2 transition-colors"
            >
              Open in Google Maps ↗
            </a>
          </div>
        </div>

        {/* Info + Form — two columns below map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Contact Info */}
          <div className="card-padded">
            <h3 className="font-display uppercase tracking-widest text-lg" style={{ color: 'var(--lb-text)' }}>
              Contact Information
            </h3>
            <ul className="mt-6 space-y-5 text-sm">
              <li>
                <p className="text-pink-500 text-xs tracking-widest uppercase">📍 Granville</p>
                <p className="mt-1 font-semibold" style={{ color: 'var(--lb-text)' }}>15 Good Street, Granville NSW 2142</p>
                <p className="text-xs mt-1" style={{ color: 'var(--lb-text-muted)' }}>5 minutes walk from Granville Station</p>
              </li>
              <li>
                <p className="text-pink-500 text-xs tracking-widest uppercase">📍 Campsie</p>
                <p className="mt-1 font-semibold" style={{ color: 'var(--lb-text)' }}>62 Beamish St, Campsie NSW 2194</p>
                <p className="text-xs mt-1" style={{ color: 'var(--lb-text-muted)' }}>Near Campsie Station</p>
              </li>
              <li>
                <p className="text-pink-500 text-xs tracking-widest uppercase">📞 Phone</p>
                <a className="hover:text-pink-500 transition-colors" href="tel:+61416065592" style={{ color: 'var(--lb-text)' }}>
                  +61 416 065 592
                </a>
              </li>
              <li>
                <p className="text-pink-500 text-xs tracking-widest uppercase">✉️ Email</p>
                <a className="hover:text-pink-500 transition-colors" href="mailto:hello@lazybarbers.com.au" style={{ color: 'var(--lb-text)' }}>
                  hello@lazybarbers.com.au
                </a>
              </li>
              <li>
                <p className="text-pink-500 text-xs tracking-widest uppercase">🕒 Hours</p>
                <p style={{ color: 'var(--lb-text-muted)' }}>Open every day · 9 am – 7 pm</p>
              </li>
            </ul>
          </div>

          {/* Contact Form */}
          <div ref={formRef} className="card-padded">
            <h3 className="font-display uppercase tracking-widest text-lg" style={{ color: 'var(--lb-text)' }}>
              Send us a message
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="form-label">Full name *</label>
                <input className="form-input" placeholder="Your name" {...register('full_name')} />
                {errors.full_name && <p className="form-error">{errors.full_name.message}</p>}
              </div>
              <div>
                <label className="form-label">Email address *</label>
                <input className="form-input" placeholder="your@email.com" {...register('email')} />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>
              <div>
                <label className="form-label">Phone number</label>
                <input className="form-input" placeholder="+61 4XX XXX XXX" {...register('phone')} />
                {errors.phone && <p className="form-error">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="form-label">Subject</label>
                <input className="form-input" placeholder="How can we help?" {...register('subject')} />
              </div>
              <div>
                <label className="form-label">Message *</label>
                <textarea
                  rows="5"
                  className="form-textarea"
                  placeholder="Tell us more about your inquiry..."
                  {...register('message')}
                />
                {errors.message && <p className="form-error">{errors.message.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ */}
        <div ref={faqRef} id="faq">
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-8 bg-gold-400 inline-block" />
            <span className="text-gold-400 text-xs tracking-widest uppercase font-display">FAQ</span>
            <span className="h-px w-8 bg-gold-400 inline-block" />
          </div>
          <h2 className="h-section text-gold-400 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3 max-w-3xl">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 text-left transition-colors"
        style={{ color: 'var(--lb-text)' }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-semibold text-sm pr-4">{question}</span>
        <span
          className="text-gold-400 text-xl flex-shrink-0"
          style={{ transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'var(--lb-text-muted)', borderTop: '1px solid var(--lb-border)' }}>
          <p className="pt-4">{answer}</p>
        </div>
      )}
    </div>
  );
}
