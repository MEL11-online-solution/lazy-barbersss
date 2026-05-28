/**
 * HTML email templates for Lazy Barbers.
 * All styles are inline — email clients don't support stylesheets.
 */

const SHOP_TZ = process.env.SHOP_TIMEZONE || 'Australia/Sydney';
const FRONTEND = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

function formatDateTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: SHOP_TZ,
  });
}

function dollars(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

// ─── Shared layout wrappers ───────────────────────────────────────────────────

function header() {
  return `
  <tr>
    <td style="background:#0f0f2d;padding:32px 40px;text-align:center;">
      <p style="margin:0;font-size:13px;letter-spacing:6px;font-weight:700;color:#D4A843;font-family:Arial,Helvetica,sans-serif;">✂ LAZY BARBERS</p>
    </td>
  </tr>
  <tr>
    <td style="height:3px;background:linear-gradient(90deg,#D4A843 0%,#E91E63 100%);font-size:0;line-height:0;">&nbsp;</td>
  </tr>`;
}

function footer() {
  return `
  <tr>
    <td style="background:#0f0f2d;padding:28px 40px;text-align:center;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:5px;color:#D4A843;font-weight:700;font-family:Arial,Helvetica,sans-serif;">LAZY BARBERS</p>
      <p style="margin:0 0 4px;font-size:12px;color:rgba(255,255,255,0.55);font-family:Arial,Helvetica,sans-serif;">
        15 Good St, Granville NSW 2142 &nbsp;&bull;&nbsp; 62 Beamish St, Campsie NSW 2194
      </p>
      <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.55);font-family:Arial,Helvetica,sans-serif;">+61 416 065 592</p>
    </td>
  </tr>`;
}

function wrap(bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0f0f0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          ${header()}
          <tr>
            <td style="padding:40px 40px 32px;color:#1a1a1a;">
              ${bodyContent}
            </td>
          </tr>
          ${footer()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label, value, last = false) {
  const border = last ? '' : 'border-bottom:1px solid #f0f0f0;';
  return `
  <tr>
    <td style="padding:11px 0;${border}font-size:14px;color:#888888;width:42%;vertical-align:top;">
      ${label}
    </td>
    <td style="padding:11px 0;${border}font-size:14px;color:#1a1a1a;font-weight:600;vertical-align:top;">
      ${value}
    </td>
  </tr>`;
}

function ctaButton(label, url) {
  return `
  <p style="margin:28px 0 0;text-align:center;">
    <a href="${url}"
       style="display:inline-block;background:#E91E63;color:#ffffff;text-decoration:none;
              padding:14px 36px;border-radius:6px;font-size:15px;font-weight:700;
              letter-spacing:0.3px;font-family:Arial,Helvetica,sans-serif;">
      ${label}
    </a>
  </p>`;
}

function sectionTitle(text) {
  return `<p style="margin:28px 0 12px;font-size:11px;letter-spacing:4px;color:#D4A843;font-weight:700;text-transform:uppercase;">${text}</p>`;
}

function textFooter() {
  return `\n--\nLazy Barbers\n15 Good St, Granville NSW 2142 | 62 Beamish St, Campsie NSW 2194\n+61 416 065 592`;
}

// ─── Templates ────────────────────────────────────────────────────────────────

function bookingConfirmation({ customerName, serviceName, barberName, dateTime, duration, location, reference, total }) {
  const subject = `Booking Confirmed — Lazy Barbers #${reference}`;

  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1a1a1a;">Booking Confirmed!</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
      Hi ${customerName}, you're all set. We'll see you soon!
    </p>

    ${sectionTitle('Booking Details')}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="border-collapse:collapse;">
      ${detailRow('Service', serviceName)}
      ${detailRow('Barber', barberName || 'Any available')}
      ${detailRow('Date &amp; Time', formatDateTime(dateTime))}
      ${detailRow('Duration', `${duration} min`)}
      ${detailRow('Location', location)}
      ${detailRow('Total', `<span style="color:#E91E63;font-size:16px;">${dollars(total)}</span>`)}
      ${detailRow('Reference', `<span style="font-family:monospace;background:#f5f5f5;padding:2px 8px;border-radius:4px;font-size:13px;">#${reference}</span>`, true)}
    </table>

    ${ctaButton('View My Bookings', `${FRONTEND}/my-bookings`)}
  `);

  const text = `Booking Confirmed - Lazy Barbers\n\nHi ${customerName},\n\nYour booking is confirmed.\n\nService:    ${serviceName}\nBarber:     ${barberName || 'Any available'}\nDate/Time:  ${formatDateTime(dateTime)}\nDuration:   ${duration} min\nLocation:   ${location}\nTotal:      ${dollars(total)}\nReference:  #${reference}\n\nView your bookings: ${FRONTEND}/my-bookings${textFooter()}`;

  return { subject, html, text };
}

function bookingCancellation({ customerName, serviceName, reference, dateTime }) {
  const subject = `Booking Cancelled — Lazy Barbers #${reference}`;

  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1a1a1a;">Booking Cancelled</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
      Hi ${customerName}, your booking has been cancelled. We hope to see you again soon!
    </p>

    ${sectionTitle('Cancelled Booking')}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="border-collapse:collapse;">
      ${detailRow('Service', serviceName)}
      ${detailRow('Original Date', formatDateTime(dateTime))}
      ${detailRow('Reference', `<span style="font-family:monospace;background:#f5f5f5;padding:2px 8px;border-radius:4px;font-size:13px;">#${reference}</span>`, true)}
    </table>

    <p style="margin:24px 0 0;font-size:14px;color:#888888;line-height:1.6;">
      Changed your mind? You can easily rebook online at any time.
    </p>

    ${ctaButton('Book Again', `${FRONTEND}/booking`)}
  `);

  const text = `Booking Cancelled - Lazy Barbers\n\nHi ${customerName},\n\nYour booking has been cancelled.\n\nService:       ${serviceName}\nOriginal Date: ${formatDateTime(dateTime)}\nReference:     #${reference}\n\nRebook online: ${FRONTEND}/booking${textFooter()}`;

  return { subject, html, text };
}

function bookingRescheduled({ customerName, serviceName, barberName, oldDateTime, newDateTime, reference }) {
  const subject = `Booking Rescheduled — Lazy Barbers #${reference}`;

  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1a1a1a;">Booking Rescheduled</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
      Hi ${customerName}, your booking has been moved to a new time.
    </p>

    ${sectionTitle('Updated Booking')}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="border-collapse:collapse;">
      ${detailRow('Service', serviceName)}
      ${detailRow('Barber', barberName || 'Any available')}
      ${detailRow('Previous Time', `<span style="text-decoration:line-through;color:#aaaaaa;">${formatDateTime(oldDateTime)}</span>`)}
      ${detailRow('New Time', `<span style="color:#16a34a;font-weight:700;">${formatDateTime(newDateTime)}</span>`)}
      ${detailRow('Reference', `<span style="font-family:monospace;background:#f5f5f5;padding:2px 8px;border-radius:4px;font-size:13px;">#${reference}</span>`, true)}
    </table>

    ${ctaButton('View My Bookings', `${FRONTEND}/my-bookings`)}
  `);

  const text = `Booking Rescheduled - Lazy Barbers\n\nHi ${customerName},\n\nYour booking has been moved.\n\nService:       ${serviceName}\nBarber:        ${barberName || 'Any available'}\nPrevious Time: ${formatDateTime(oldDateTime)}\nNew Time:      ${formatDateTime(newDateTime)}\nReference:     #${reference}\n\nView your bookings: ${FRONTEND}/my-bookings${textFooter()}`;

  return { subject, html, text };
}

function paymentReceipt({ customerName, customerEmail, customerPhone, serviceName, barberName, dateTime, reference, total, paymentMethod, cardLast4, transactionId }) {
  const subject = `Tax Invoice — Lazy Barbers #${reference}`;

  const gst = total / 11;
  const subtotal = total - gst;
  const paymentDisplay = cardLast4
    ? `Visa ending ****${cardLast4}`
    : paymentMethod === 'online' ? 'Card (online)' : 'Pay at Counter';

  const html = wrap(`
    <h2 style="margin:0 0 4px;font-size:22px;color:#1a1a1a;letter-spacing:1px;text-transform:uppercase;">Tax Invoice</h2>
    <p style="margin:0 0 4px;font-size:12px;color:#888888;">ABN: 00 000 000 000</p>
    <p style="margin:0 0 24px;font-size:12px;color:#888888;">Receipt #${reference} &nbsp;&bull;&nbsp; ${formatDateTime(new Date().toISOString())}</p>

    ${sectionTitle('Billed To')}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
      ${detailRow('Name', customerName)}
      ${customerEmail ? detailRow('Email', customerEmail) : ''}
      ${customerPhone ? detailRow('Phone', customerPhone) : ''}
    </table>

    ${sectionTitle('Appointment')}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
      ${detailRow('Service', serviceName)}
      ${detailRow('Barber', barberName || 'Any available')}
      ${detailRow('Date &amp; Time', formatDateTime(dateTime))}
      ${detailRow('Booking Ref', `<span style="font-family:monospace;background:#f5f5f5;padding:2px 6px;border-radius:4px;font-size:13px;">#${reference}</span>`, true)}
    </table>

    ${sectionTitle('Payment Summary')}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
      ${detailRow('Subtotal (ex-GST)', dollars(subtotal))}
      ${detailRow('GST (10%)', dollars(gst))}
      ${detailRow('Total (inc-GST)', `<span style="color:#E91E63;font-size:17px;font-weight:700;">${dollars(total)} AUD</span>`)}
      ${detailRow('Payment Method', paymentDisplay)}
      ${transactionId ? detailRow('Stripe Transaction', `<span style="font-family:monospace;font-size:11px;color:#666666;">${transactionId}</span>`, true) : detailRow('Status', 'PAID', true)}
    </table>

    <p style="margin:24px 0 0;padding:14px 16px;background:#f9f9f9;border-radius:6px;font-size:12px;color:#888888;line-height:1.6;text-align:center;">
      For refund requests, please contact us within 48 hours of this receipt.<br>
      This document serves as a valid Australian tax invoice.
    </p>

    ${ctaButton('View My Bookings', `${FRONTEND}/my-bookings`)}
  `);

  const textLines = [
    `Tax Invoice - Lazy Barbers`,
    ``,
    `TAX INVOICE`,
    `ABN: 00 000 000 000`,
    `Receipt #${reference}`,
    ``,
    `Billed To:`,
    customerName,
    customerEmail || '',
    customerPhone || '',
    ``,
    `Appointment:`,
    `Service:   ${serviceName}`,
    `Barber:    ${barberName || 'Any available'}`,
    `Date/Time: ${formatDateTime(dateTime)}`,
    ``,
    `Payment Summary:`,
    `Subtotal (ex-GST): ${dollars(subtotal)}`,
    `GST (10%):         ${dollars(gst)}`,
    `Total (inc-GST):   ${dollars(total)} AUD`,
    `Payment:           ${paymentDisplay}`,
    transactionId ? `Stripe Txn:        ${transactionId}` : '',
    ``,
    `For refund requests, contact us within 48 hours.`,
    `This document serves as a valid Australian tax invoice.`,
    ``,
    `View your bookings: ${FRONTEND}/my-bookings`,
  ].filter((l) => l !== null);

  const text = textLines.join('\n') + textFooter();

  return { subject, html, text };
}

function bookingReminder({ customerName, serviceName, barberName, dateTime, location }) {
  const subject = 'Appointment Reminder — Lazy Barbers';

  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1a1a1a;">Your appointment is in 1 hour!</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
      Hi ${customerName}, this is a friendly reminder that your appointment is coming up soon.
    </p>

    ${sectionTitle('Appointment Details')}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="border-collapse:collapse;">
      ${detailRow('Service', serviceName)}
      ${detailRow('Barber', barberName || 'Your barber')}
      ${detailRow('Time', formatDateTime(dateTime))}
      ${detailRow('Location', location, true)}
    </table>

    <p style="margin:24px 0 0;font-size:14px;color:#888888;line-height:1.6;">
      Please arrive a few minutes early. We look forward to seeing you!
    </p>

    ${ctaButton('View My Bookings', `${FRONTEND}/my-bookings`)}
  `);

  const text = `Appointment Reminder - Lazy Barbers\n\nHi ${customerName},\n\nYour appointment is in 1 hour!\n\nService:  ${serviceName}\nBarber:   ${barberName || 'Your barber'}\nTime:     ${formatDateTime(dateTime)}\nLocation: ${location}\n\nPlease arrive a few minutes early. See you soon!\n\nView your bookings: ${FRONTEND}/my-bookings${textFooter()}`;

  return { subject, html, text };
}

function clubWelcome({ firstName }) {
  const name = firstName || 'there';
  const subject = 'Welcome to the Lazy Barbers Club — Your VIP Access Starts Now';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0f0f0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation"
        style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.10);">

        <!-- HEADER -->
        <tr><td style="background:#0f0f2d;padding:36px 40px;text-align:center;">
          <p style="margin:0;font-size:13px;letter-spacing:6px;font-weight:700;color:#D4A843;font-family:Arial,Helvetica,sans-serif;">✂ LAZY BARBERS</p>
          <p style="margin:8px 0 0;font-size:11px;letter-spacing:3px;color:rgba(255,255,255,0.45);font-family:Arial,Helvetica,sans-serif;">EXCLUSIVE MEMBER CLUB</p>
        </td></tr>
        <tr><td style="height:4px;background:linear-gradient(90deg,#D4A843 0%,#E91E63 100%);font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- HERO -->
        <tr><td style="padding:48px 40px 36px;text-align:center;background:#ffffff;">
          <h1 style="margin:0 0 12px;font-size:28px;font-weight:700;color:#1a1a1a;font-family:Arial,Helvetica,sans-serif;line-height:1.3;">
            Welcome to the Club, ${name}!
          </h1>
          <p style="margin:0;font-size:16px;color:#555555;line-height:1.7;max-width:460px;margin:0 auto;">
            You're now part of an exclusive community of gentlemen who value premium grooming.
            Your VIP access starts today.
          </p>
          <div style="margin:28px auto 0;width:60px;height:3px;background:linear-gradient(90deg,#D4A843,#E91E63);border-radius:2px;"></div>
        </td></tr>

        <!-- BENEFITS -->
        <tr><td style="padding:0 40px 36px;">
          <p style="margin:0 0 20px;font-size:11px;letter-spacing:4px;color:#D4A843;font-weight:700;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Your Member Benefits</p>

          ${[
            ['✂', 'Exclusive Member Discounts', 'Enjoy special pricing on all services, available only to club members.'],
            ['📅', 'Priority Booking', 'Get early access to peak-time slots before they\'re available to the public.'],
            ['🎁', 'Birthday Special', 'Receive a complimentary service upgrade during your birthday month.'],
            ['💈', 'Seasonal Promotions', 'Be the first to know about limited-time offers and new service launches.'],
            ['📱', 'Grooming Tips & Trends', 'Monthly curated content on men\'s grooming, styling tips, and product recommendations.'],
            ['⭐', 'Loyalty Rewards', 'Earn points with every visit that can be redeemed for free services.'],
          ].map(([icon, title, desc]) => `
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;margin-bottom:16px;">
            <tr>
              <td style="vertical-align:top;padding:14px 16px;background:#fafafa;border-radius:8px;border-left:3px solid #D4A843;">
                <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#1a1a1a;">${icon} ${title}</p>
                <p style="margin:0;font-size:13px;color:#666666;line-height:1.6;">${desc}</p>
              </td>
            </tr>
          </table>`).join('')}
        </td></tr>

        <!-- BOOK NOW CTA -->
        <tr><td style="padding:0 40px 40px;text-align:center;background:#f9f9f9;border-top:1px solid #eeeeee;border-bottom:1px solid #eeeeee;">
          <p style="margin:32px 0 8px;font-size:11px;letter-spacing:4px;color:#D4A843;font-weight:700;text-transform:uppercase;">Book Your Next Appointment</p>
          <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
            Ready for your next premium cut? Book now and experience the Lazy Barbers difference.
          </p>
          <a href="${FRONTEND}/booking"
             style="display:inline-block;background:#E91E63;color:#ffffff;text-decoration:none;
                    padding:16px 40px;border-radius:6px;font-size:15px;font-weight:700;
                    letter-spacing:0.5px;font-family:Arial,Helvetica,sans-serif;">
            Book Now &rarr;
          </a>
        </td></tr>

        <!-- LOCATIONS -->
        <tr><td style="padding:36px 40px;">
          <p style="margin:0 0 20px;font-size:11px;letter-spacing:4px;color:#D4A843;font-weight:700;text-transform:uppercase;">Our Locations</p>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
            <tr>
              <td width="48%" style="vertical-align:top;padding:16px;background:#fafafa;border-radius:8px;border-top:3px solid #D4A843;">
                <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#D4A843;">📍 Granville</p>
                <p style="margin:0 0 4px;font-size:13px;color:#1a1a1a;">15 Good St, Granville NSW 2142</p>
                <p style="margin:0;font-size:12px;color:#888888;">Open 7 days · 9am — 7pm</p>
              </td>
              <td width="4%"></td>
              <td width="48%" style="vertical-align:top;padding:16px;background:#fafafa;border-radius:8px;border-top:3px solid #D4A843;">
                <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#D4A843;">📍 Campsie</p>
                <p style="margin:0 0 4px;font-size:13px;color:#1a1a1a;">62 Beamish St, Campsie NSW 2194</p>
                <p style="margin:0;font-size:12px;color:#888888;">Open 7 days · 9am — 7pm</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- JOIN OUR TEAM -->
        <tr><td style="padding:0 40px 36px;background:#f9f9f9;border-top:1px solid #eeeeee;">
          <p style="margin:32px 0 8px;font-size:11px;letter-spacing:4px;color:#D4A843;font-weight:700;text-transform:uppercase;">Join Our Team</p>
          <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#1a1a1a;">Are you a passionate barber looking for your next opportunity?</p>
          <p style="margin:0 0 16px;font-size:13px;color:#555555;line-height:1.7;">
            Lazy Barbers is always looking for talented and creative barbers to join our growing team.
            We offer competitive pay, flexible hours, a supportive team environment, and the chance to work with premium clients.
          </p>
          <p style="margin:0;font-size:13px;color:#555555;">
            Send your resume and portfolio to
            <a href="mailto:lazybarbers.booking@gmail.com" style="color:#E91E63;text-decoration:none;font-weight:700;">lazybarbers.booking@gmail.com</a>
          </p>
        </td></tr>

        <!-- SOCIAL -->
        <tr><td style="padding:28px 40px;text-align:center;background:#ffffff;border-top:1px solid #eeeeee;">
          <p style="margin:0 0 16px;font-size:11px;letter-spacing:3px;color:#888888;text-transform:uppercase;">Connect With Us</p>
          <a href="https://www.facebook.com/p/Lazy-Barbers-61554922094895/" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin:0 8px;padding:8px 16px;background:#0f0f2d;color:#D4A843;text-decoration:none;font-size:12px;font-weight:700;border-radius:4px;letter-spacing:1px;">Facebook</a>
          <a href="https://www.instagram.com/lazy_barbers/" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin:0 8px;padding:8px 16px;background:#0f0f2d;color:#D4A843;text-decoration:none;font-size:12px;font-weight:700;border-radius:4px;letter-spacing:1px;">Instagram</a>
          <a href="https://www.tiktok.com/@lazy.barbers" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin:0 8px;padding:8px 16px;background:#0f0f2d;color:#D4A843;text-decoration:none;font-size:12px;font-weight:700;border-radius:4px;letter-spacing:1px;">TikTok</a>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#0f0f2d;padding:28px 40px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:5px;color:#D4A843;font-weight:700;font-family:Arial,Helvetica,sans-serif;">LAZY BARBERS</p>
          <p style="margin:0 0 4px;font-size:12px;color:rgba(255,255,255,0.55);">
            15 Good St, Granville NSW 2142 &nbsp;&bull;&nbsp; 62 Beamish St, Campsie NSW 2194
          </p>
          <p style="margin:0 0 12px;font-size:12px;color:rgba(255,255,255,0.55);">+61 416 065 592</p>
          <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.35);">&copy; 2026 Lazy Barbers. All rights reserved.</p>
          <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.35);">You're receiving this because you signed up for the Lazy Barbers Club.</p>
          <a href="mailto:lazybarbers.booking@gmail.com?subject=Unsubscribe"
             style="font-size:11px;color:rgba(255,255,255,0.4);text-decoration:underline;">Unsubscribe</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Welcome to the Lazy Barbers Club!\n\nHi ${name},\n\nYou're now part of an exclusive community of gentlemen who value premium grooming.\n\nYOUR MEMBER BENEFITS:\n- Exclusive Member Discounts\n- Priority Booking — early access to peak-time slots\n- Birthday Special — complimentary service upgrade in your birthday month\n- Seasonal Promotions — first to know about limited-time offers\n- Grooming Tips & Trends — monthly curated content\n- Loyalty Rewards — earn points redeemable for free services\n\nBook your next appointment: ${FRONTEND}/booking\n\nOUR LOCATIONS:\n- Granville: 15 Good St, Granville NSW 2142\n- Campsie: 62 Beamish St, Campsie NSW 2194\nOpen 7 days · 9am - 7pm\n\nJOIN OUR TEAM:\nAre you a passionate barber? Send your resume to lazybarbers.booking@gmail.com\n\n--\nLazy Barbers\nUnsubscribe: mailto:lazybarbers.booking@gmail.com?subject=Unsubscribe`;

  return { subject, html, text };
}

// ─── Admin notification templates ──────────────────────────────────────────────

function adminNewBooking({
  reference,
  customerName,
  customerEmail,
  customerPhone,
  serviceName,
  barberName,
  dateTime,
  paymentMethod,
  total,
}) {
  const subject = `New Booking Received — Lazy Barbers #${reference}`;
  const paymentDisplay = paymentMethod === 'online' ? 'Card (online)' : 'Pay at Counter';

  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1a1a1a;">New Booking Received</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
      A new booking has just been made. Details below.
    </p>

    ${sectionTitle('Customer')}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
      ${detailRow('Name', customerName)}
      ${customerEmail ? detailRow('Email', customerEmail) : ''}
      ${detailRow('Phone', customerPhone || '—', true)}
    </table>

    ${sectionTitle('Booking Details')}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
      ${detailRow('Service', serviceName)}
      ${detailRow('Barber', barberName || 'Any available')}
      ${detailRow('Date &amp; Time', formatDateTime(dateTime))}
      ${detailRow('Payment', paymentDisplay)}
      ${detailRow('Total', `<span style="color:#E91E63;font-size:16px;">${dollars(total)}</span>`)}
      ${detailRow('Reference', `<span style="font-family:monospace;background:#f5f5f5;padding:2px 8px;border-radius:4px;font-size:13px;">#${reference}</span>`, true)}
    </table>

    ${ctaButton('Open Admin Dashboard', `${FRONTEND}/admin`)}
  `);

  const text = `New Booking Received - Lazy Barbers #${reference}\n\nCustomer:  ${customerName}\nEmail:     ${customerEmail || '—'}\nPhone:     ${customerPhone || '—'}\n\nService:   ${serviceName}\nBarber:    ${barberName || 'Any available'}\nDate/Time: ${formatDateTime(dateTime)}\nPayment:   ${paymentDisplay}\nTotal:     ${dollars(total)}\nReference: #${reference}\n\nAdmin dashboard: ${FRONTEND}/admin${textFooter()}`;

  return { subject, html, text };
}

function adminBookingCancelled({
  reference,
  customerName,
  serviceName,
  dateTime,
  reason,
}) {
  const subject = `Booking Cancelled — Lazy Barbers #${reference}`;

  const html = wrap(`
    <h2 style="margin:0 0 8px;font-size:24px;color:#1a1a1a;">Booking Cancelled</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
      A customer has cancelled their booking. Details below.
    </p>

    ${sectionTitle('Cancelled Booking')}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
      ${detailRow('Customer', customerName)}
      ${detailRow('Service', serviceName)}
      ${detailRow('Original Date', formatDateTime(dateTime))}
      ${detailRow('Reason', reason || 'Not specified')}
      ${detailRow('Reference', `<span style="font-family:monospace;background:#f5f5f5;padding:2px 8px;border-radius:4px;font-size:13px;">#${reference}</span>`, true)}
    </table>

    ${ctaButton('Open Admin Dashboard', `${FRONTEND}/admin`)}
  `);

  const text = `Booking Cancelled - Lazy Barbers #${reference}\n\nCustomer:      ${customerName}\nService:       ${serviceName}\nOriginal Date: ${formatDateTime(dateTime)}\nReason:        ${reason || 'Not specified'}\nReference:     #${reference}\n\nAdmin dashboard: ${FRONTEND}/admin${textFooter()}`;

  return { subject, html, text };
}

module.exports = {
  bookingConfirmation,
  bookingCancellation,
  bookingRescheduled,
  paymentReceipt,
  bookingReminder,
  clubWelcome,
  adminNewBooking,
  adminBookingCancelled,
};
