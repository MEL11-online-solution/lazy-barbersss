/**
 * LazyBot chatbot service.
 *
 * Tries OpenAI (gpt-4o-mini) first; falls back to rule-based keyword
 * matching if the API key is absent, times out, or errors. Returns:
 *   { reply: string, quick_actions: [{ label, action, payload }] }
 */
const OpenAI = require('openai');
const serviceRepo = require('../repositories/serviceRepo');
const barberRepo = require('../repositories/barberRepo');
const { whoIsAvailableNow } = require('./realtimeAvailabilityService');
const { timeToMinutes } = require('../utils/time');

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const SHOP_TIMEZONE = process.env.SHOP_TIMEZONE || 'Australia/Sydney';
const BUSINESS_NAME = process.env.BUSINESS_NAME || 'Lazy Barbers';
const BUSINESS_PHONE = process.env.BUSINESS_PHONE || '+61 416 065 592';
const BUSINESS_ADDRESS = process.env.BUSINESS_ADDRESS || '15 Good St, Granville NSW';

// Returns the current date/time broken down in the shop's local timezone.
function getShopLocalNow() {
  const now = new Date();

  const timeFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: SHOP_TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const tp = timeFmt.formatToParts(now);
  const get = (type) => tp.find((p) => p.type === type)?.value;
  const weekday = get('weekday');
  const hour = Number(get('hour'));
  const minute = Number(get('minute'));

  // en-CA reliably formats dates as YYYY-MM-DD
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: SHOP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    dow: DOW[weekday],
    minutes: hour * 60 + minute,
    dateStr,
    timeStr: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  };
}

// Builds a plain-text availability summary for injection into the system prompt.
async function buildAvailabilityContext() {
  const shopNow = getShopLocalNow();

  // Run the "available now" check and active-barber list in parallel
  const [{ available: availableNow }, activeBarbers] = await Promise.all([
    whoIsAvailableNow(),
    barberRepo.listActive(),
  ]);
  const availableNowIds = new Set(availableNow.map((b) => b.id));

  const lines = [];
  // Per-barber: schedule + time-off in parallel
  await Promise.all(
    activeBarbers.map(async (barber) => {
      const [schedule, timeOff] = await Promise.all([
        barberRepo.getSchedule(barber.id),
        barberRepo.listTimeOffOverlapping(barber.id, shopNow.dateStr),
      ]);

      const name = `${barber.first_name} ${barber.last_name}`;

      if (timeOff.length > 0) {
        lines.push(`- ${name}: on approved time off today`);
        return;
      }

      const today = schedule.find((d) => d.day_of_week === shopNow.dow);
      if (!today || !today.is_working) {
        lines.push(`- ${name}: not scheduled today`);
        return;
      }

      const startMin = timeToMinutes(today.start_time);
      const endMin = timeToMinutes(today.end_time);
      const hours = `${today.start_time}–${today.end_time}`;

      let status;
      if (shopNow.minutes < startMin) {
        status = `shift starts at ${today.start_time}`;
      } else if (shopNow.minutes >= endMin) {
        status = `shift ended at ${today.end_time}`;
      } else if (availableNowIds.has(barber.id)) {
        status = 'AVAILABLE NOW';
      } else {
        status = 'currently with a client';
      }

      lines.push(`- ${name}: working ${hours}, ${status}`);
    })
  );

  // Sort alphabetically so the output is deterministic
  lines.sort();

  const walkInList =
    availableNow.length > 0
      ? availableNow.map((b) => b.first_name).join(', ')
      : 'none at this moment';

  return (
    `Today is ${shopNow.dateStr}, current shop time: ${shopNow.timeStr}.\n\n` +
    `Barber availability today:\n${lines.join('\n')}\n\n` +
    `Available for immediate walk-in: ${walkInList}`
  );
}

const INTENTS = [
  {
    name: 'greeting',
    patterns: [/^(hi|hello|hey|yo|good morning|good afternoon|good evening)\b/iu],
  },
  {
    name: 'hours',
    patterns: [
      /\b(hour|hours|open|opening|closing|when.*open|what time)\b/iu,
    ],
  },
  {
    name: 'location',
    patterns: [
      /\b(location|address|where.*you|how.*get there|directions|granville)\b/iu,
    ],
  },
  {
  name: 'availability_now',
  patterns: [
    /\b(available|free|vacant|open)\s+(now|right now|today|currently)\b/iu,
    /\b(who|which barber).*(available|free|vacant|open)\b/iu,
    /\b(is anyone|anyone)\s+(available|free)\b/iu,
  ],
},
  {
    name: 'services',
    patterns: [
      /\b(service|services|offer|do you do|menu|what.*do)\b/iu,
    ],
  },
  {
    name: 'prices',
    patterns: [
      /\b(price|prices|cost|costs|how much|fee)\b/iu,
    ],
  },
  {
    name: 'book',
    patterns: [
      /\b(book|booking|appointment|reserve|schedule)\b/iu,
    ],
  },
  {
    name: 'contact',
    patterns: [/\b(contact|phone|call|email|reach)\b/iu],
  },
  {
    name: 'thanks',
    patterns: [/\b(thanks|thank you|cheers|appreciated)\b/iu],
  },
];

function detectIntent(message) {
  for (const intent of INTENTS) {
    if (intent.patterns.some((p) => p.test(message))) return intent.name;
  }
  return 'fallback';
}

function tryMatchSpecificService(message, services) {
  const lower = message.toLowerCase();
  for (const svc of services) {
    if (lower.includes(svc.name.toLowerCase())) return svc;
  }
  return null;
}

async function respond({ message }) {
  const text = String(message || '').trim();
  if (!text) {
    return {
      reply: `Hey! 👋 I'm LazyBot. How can I help you today?`,
      quick_actions: defaultQuickActions(),
    };
  }

  const services = await serviceRepo.listActive();

  // Try OpenAI first; on any failure fall through to keyword matching
  if (openaiClient) {
    try {
      const serviceList = services
        .map((s) => `- ${s.name}: $${s.price.toFixed(2)} (${s.duration_minutes} min)`)
        .join('\n');

      // Fetch live availability; silently skip if it fails (non-critical)
      let availabilityContext = '';
      try {
        availabilityContext = await buildAvailabilityContext();
      } catch (_e) { /* degraded gracefully */ }

      const systemPrompt =
        `You are LazyBot, a helpful assistant for Lazy Barbers barbershop. ` +
        `You help customers with booking appointments, service information, pricing, and general questions. ` +
        `Keep responses short, friendly, and relevant to barbershop services. ` +
        `If asked something unrelated to barbershop services, politely redirect the conversation.\n\n` +
        `Business information:\n` +
        `Lazy Barbers has two locations:\n` +
        `1. Granville — 15 Good St, Granville NSW 2142 (5 min walk from Granville Station)\n` +
        `2. Campsie — 62 Beamish St, Campsie NSW 2194\n\n` +
        `Opening hours: Monday to Sunday, 9am to 7pm at both locations.\n` +
        `Phone: +61 416 065 592\n` +
        `Email: hello@lazybarbers.com.au\n` +
        `Website: lazybarbers.com.au\n\n` +
        `When customers ask about location, directions, address, hours, or how to find us, provide this information clearly.\n\n` +
        `Available services:\n${serviceList}` +
        (availabilityContext ? `\n\n${availabilityContext}` : '');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const completion = await openaiClient.chat.completions.create(
        {
          model: 'gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 150,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text },
          ],
        },
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      return {
        reply: completion.choices[0].message.content,
        quick_actions: defaultQuickActions(),
      };
    } catch (_err) {
      // Timeout, API error, or missing key — fall through to keyword matching
    }
  }

  // 1. Specific service mentioned (e.g. "can I book a skin fade?")
  const matchedService = tryMatchSpecificService(text, services);

  const intent = detectIntent(text);

  // Combine intent + service detection
  if (matchedService && (intent === 'book' || intent === 'prices')) {
    return {
      reply: `Absolutely! ${matchedService.name} is $${matchedService.price.toFixed(2)} (${matchedService.duration_minutes} min). Tap below to book.`,
      quick_actions: [
        { label: `Book ${matchedService.name} — $${matchedService.price.toFixed(2)}`, action: 'book_service', payload: { service_id: matchedService.id } },
        { label: 'See all services', action: 'navigate', payload: { path: '/services' } },
      ],
    };
  }

  switch (intent) {
    case 'greeting':
      return {
        reply: `Hey! 👋 I'm LazyBot — ${BUSINESS_NAME}'s AI assistant. How can I help?`,
        quick_actions: defaultQuickActions(),
      };

    case 'hours':
      return {
        reply: `We're open every day, **9 AM – 7 PM**.\n📍 ${BUSINESS_ADDRESS} — just 5 min walk from Granville Station!`,
        quick_actions: [
          { label: 'Book a cut', action: 'navigate', payload: { path: '/booking' } },
          { label: 'Get directions', action: 'navigate', payload: { path: '/contact' } },
        ],
      };

    case 'location':
      return {
        reply: `📍 ${BUSINESS_ADDRESS}, Australia.\nWe're 5 min walk from Granville Station.`,
        quick_actions: [
          { label: 'Contact us', action: 'navigate', payload: { path: '/contact' } },
          { label: 'Book now', action: 'navigate', payload: { path: '/booking' } },
        ],
      };

      case 'availability_now': {
  const realtime = require('./realtimeAvailabilityService');
  const { available } = await realtime.whoIsAvailableNow();

  if (available.length === 0) {
    return {
      reply: `All our barbers are currently booked or off-shift. Want to book the next free slot?`,
      quick_actions: [
        { label: 'Book a cut', action: 'navigate', payload: { path: '/booking' } },
        { label: 'See team', action: 'navigate', payload: { path: '/team' } },
      ],
    };
  }

  const names = available.map((b) => b.first_name).join(', ');
  return {
    reply: `Available right now: **${names}**. ✂️ Want to book?`,
    quick_actions: [
      { label: 'Book a cut', action: 'navigate', payload: { path: '/booking' } },
      { label: 'See team', action: 'navigate', payload: { path: '/team' } },
    ],
  };
}

    case 'services': {
      const list = services
        .slice(0, 6)
        .map((s) => `• ${s.name} — $${s.price.toFixed(2)} (${s.duration_minutes} min)`)
        .join('\n');
      return {
        reply: `Here's our menu:\n${list}`,
        quick_actions: [
          { label: 'See all services', action: 'navigate', payload: { path: '/services' } },
          { label: 'Book now', action: 'navigate', payload: { path: '/booking' } },
        ],
      };
    }

    case 'prices': {
      const list = services
        .slice(0, 6)
        .map((s) => `• ${s.name}: $${s.price.toFixed(2)}`)
        .join('\n');
      return {
        reply: `Pricing:\n${list}`,
        quick_actions: [
          { label: 'View full pricing', action: 'navigate', payload: { path: '/services' } },
          { label: 'Book now', action: 'navigate', payload: { path: '/booking' } },
        ],
      };
    }

    case 'book':
      return {
        reply: `Awesome — you can book online in under a minute. I can take you there now.`,
        quick_actions: [
          { label: 'Book a cut', action: 'navigate', payload: { path: '/booking' } },
          { label: 'See services first', action: 'navigate', payload: { path: '/services' } },
        ],
      };

    case 'contact':
      return {
        reply: `📞 ${BUSINESS_PHONE}\n📍 ${BUSINESS_ADDRESS}\nOr drop us a message via the contact form.`,
        quick_actions: [
          { label: 'Open contact form', action: 'navigate', payload: { path: '/contact' } },
        ],
      };

    case 'thanks':
      return {
        reply: `Anytime! ✂️`,
        quick_actions: defaultQuickActions(),
      };

    case 'fallback':
    default:
      return {
        reply: `I'm not 100% sure on that one — but I can help with bookings, hours, services, prices, or location. What were you looking for?`,
        quick_actions: defaultQuickActions(),
      };
  }
}

function defaultQuickActions() {
  return [
    { label: 'Book a cut', action: 'navigate', payload: { path: '/booking' } },
    { label: 'Services', action: 'navigate', payload: { path: '/services' } },
    { label: 'Hours', action: 'intent', payload: { intent: 'hours' } },
    { label: 'Location', action: 'intent', payload: { intent: 'location' } },
  ];
}

module.exports = { respond };
