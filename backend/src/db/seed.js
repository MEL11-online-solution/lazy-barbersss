/**
 * Seed the database with a default admin, 5 barbers, 6 services, and
 * a few published reviews. Idempotent: skips rows that already exist.
 *
 * Usage:  npm run db:seed
 */
require('dotenv').config();

const { db, schema, pool } = require('../config/db');
const { eq, sql } = require('drizzle-orm');
const { hashPassword } = require('../utils/hash');
const { BUSINESS_HOURS } = require('../config/constants');

const { users, barbers, barberSchedules, services, reviews } = schema;

const ADMIN = {
  email: 'adminlazybarbers@gmail.com',
  password: 'Admin123!',
  first_name: 'Admin',
  last_name: 'User',
  phone: '+61 416 065 592',
};

const BARBERS = [
  {
    email: 'jase@lazybarbers.com',
    password: 'Barber123!',
    first_name: 'Jase',
    last_name: 'Macas',
    phone: '+61 400 000 001',
    specialty: 'Senior Barber',
    bio: 'Senior barber with 10+ years of experience in classic cuts and modern styles.',
    rating: '4.9',
    review_count: 234,
    avatar: '/team/jayson.jpg',
  },
  {
    email: 'pawan@lazybarbers.com',
    password: 'Barber123!',
    first_name: 'Pawan',
    last_name: 'Neupane',
    phone: '+61 400 000 002',
    specialty: 'Master Barber',
    bio: 'Master barber known for premium styling and consultation.',
    rating: '4.8',
    review_count: 189,
    avatar: '/team/pawan.jpg',
  },
  {
    email: 'sarun@lazybarbers.com',
    password: 'Barber123!',
    first_name: 'Sarun',
    last_name: 'Magar',
    phone: '+61 400 000 003',
    specialty: 'Specialist',
    bio: 'Fade & design specialist. Currently on leave — returns Apr 20.',
    rating: '4.9',
    review_count: 156,
    status: 'on_leave',
    avatar: '/team/sarun.jpg',
  },
  {
    email: 'rubin@lazybarbers.com',
    password: 'Barber123!',
    first_name: 'Rubin',
    last_name: 'Bhandari',
    phone: '+61 400 000 004',
    specialty: 'Styling Expert',
    bio: 'Custom styling for special occasions and events.',
    rating: '4.8',
    review_count: 142,
    avatar: '/team/rubin.jpg',
  },
  {
    email: 'chakit@lazybarbers.com',
    password: 'Barber123!',
    first_name: 'Chakit',
    last_name: 'Paudel',
    phone: '+61 400 000 005',
    specialty: 'Beard Specialist',
    bio: 'Specializes in beard grooming, hot towel shaves, and detail line work.',
    rating: '4.9',
    review_count: 178,
    avatar: '/team/chakit.jpg',
  },
  {
    email: 'sumit@lazybarbers.com',
    password: 'Barber123!',
    first_name: 'Sumit',
    last_name: 'Sharma',
    phone: '+61 400 000 006',
    specialty: 'Classic Cuts',
    bio: 'Expert in classic and traditional barbering techniques with attention to detail and clean finishes.',
    rating: '4.80',
    review_count: 165,
    avatar: '/team/sumit.jpg',
  },
];

const SERVICES = [
  {
    name: 'Classic Haircut',
    description: 'Timeless cuts that never go out of style. Precision and attention to detail in every snip.',
    category: 'Haircut',
    price_cents: 3000,
    duration_minutes: 30,
    display_order: 1,
  },
  {
    name: 'Beard Trim',
    description: 'Keep your beard looking sharp and well-groomed. Beard shaping and detailed line work.',
    category: 'Beard',
    price_cents: 2000,
    duration_minutes: 15,
    display_order: 2,
  },
  {
    name: 'Hair + Beard Combo',
    description: 'Complete grooming combo — haircut and beard trim together for the full experience.',
    category: 'Combo',
    price_cents: 4500,
    duration_minutes: 50,
    display_order: 3,
  },
  {
    name: 'Premium Styling',
    description: 'Custom styling for special occasions. Includes consultation, premium products, and finishing touches.',
    category: 'Haircut',
    price_cents: 5000,
    duration_minutes: 60,
    display_order: 4,
  },
  {
    name: 'Kids Haircut',
    description: 'Patient, friendly haircuts for kids, designed to be a fun experience.',
    category: 'Haircut',
    price_cents: 2500,
    duration_minutes: 25,
    display_order: 5,
  },
  {
    name: 'Skin Fade',
    description: 'Specialty service featuring expert fade techniques for that perfect gradient.',
    category: 'Haircut',
    price_cents: 4000,
    duration_minutes: 35,
    display_order: 6,
  },
];

const REVIEWS = [
  {
    customer_name: 'John Smith',
    rating: 5,
    comment: 'Best haircut I\'ve had in years! The attention to detail is incredible.',
    service_name: 'Classic Haircut',
  },
  {
    customer_name: 'Michael Chen',
    rating: 5,
    comment: 'Professional and friendly service. They took time to understand exactly what I wanted.',
    service_name: 'Premium Styling',
  },
  {
    customer_name: 'David Wilson',
    rating: 5,
    comment: 'Highly recommend Lazy Barbers to anyone looking for quality grooming. Great value for money!',
    service_name: 'Hair + Beard Combo',
  },
  {
    customer_name: 'Sarah Johnson',
    rating: 5,
    comment: 'Amazing experience. The barbers are skilled and the atmosphere is welcoming.',
    service_name: 'Skin Fade',
  },
  {
    customer_name: 'Robert Taylor',
    rating: 4,
    comment: 'Great service and reasonable prices. Only minor wait time during peak hours, but worth it.',
    service_name: 'Beard Trim',
  },
  {
    customer_name: 'Alex Anderson',
    rating: 5,
    comment: 'Been coming here for months now. Consistent quality and friendly staff make this my go-to.',
    service_name: 'Classic Haircut',
  },
];

async function findUserByEmail(email) {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] || null;
}

async function ensureAdmin() {
  const existing = await findUserByEmail(ADMIN.email);
  if (existing) {
    console.log(`  · admin already exists (${ADMIN.email})`);
    return existing.id;
  }
  const password_hash = await hashPassword(ADMIN.password);
  const [r] = await db.insert(users).values({
    firstName: ADMIN.first_name,
    lastName: ADMIN.last_name,
    email: ADMIN.email,
    phone: ADMIN.phone,
    passwordHash: password_hash,
    role: 'admin',
    emailVerified: 1,
  });
  console.log(`  ✓ admin created (${ADMIN.email})`);
  return r.insertId;
}

async function ensureBarber(b) {
  const existing = await findUserByEmail(b.email);
  let userId;
  if (existing) {
    console.log(`  · barber user exists (${b.email})`);
    userId = existing.id;
  } else {
    const password_hash = await hashPassword(b.password);
    const [r] = await db.insert(users).values({
      firstName: b.first_name,
      lastName: b.last_name,
      email: b.email,
      phone: b.phone,
      passwordHash: password_hash,
      role: 'barber',
      emailVerified: 1,
    });
    userId = r.insertId;
    console.log(`  ✓ barber user created (${b.email})`);
  }

  // barber profile
  const existingBarber = await db.select().from(barbers).where(eq(barbers.userId, userId)).limit(1);
  let barberId;
  if (existingBarber[0]) {
    barberId = existingBarber[0].id;
    if (b.avatar && existingBarber[0].avatarUrl !== b.avatar) {
      await db.update(barbers).set({ avatarUrl: b.avatar }).where(eq(barbers.id, barberId));
    }
    console.log(`    · barber profile exists`);
  } else {
    const [r] = await db.insert(barbers).values({
      userId,
      specialty: b.specialty,
      bio: b.bio,
      avatarUrl: b.avatar || null,
      rating: b.rating,
      reviewCount: b.review_count || 0,
      status: b.status || 'active',
      notes: null,
    });
    barberId = r.insertId;
    console.log(`    ✓ barber profile created`);
  }

  // schedule (every day, business hours)
  for (let dow = 0; dow < 7; dow++) {
    const hours = BUSINESS_HOURS[dow];
    await db.execute(sql`
      INSERT INTO barber_schedules (barber_id, day_of_week, start_time, end_time, is_working)
      VALUES (${barberId}, ${dow}, ${hours.start}, ${hours.end}, 1)
      ON DUPLICATE KEY UPDATE
        start_time = VALUES(start_time),
        end_time   = VALUES(end_time),
        is_working = VALUES(is_working)
    `);
  }
  return barberId;
}

async function ensureService(s) {
  const existing = await db.select().from(services).where(eq(services.name, s.name)).limit(1);
  if (existing[0]) {
    console.log(`  · service exists: ${s.name}`);
    return existing[0].id;
  }
  const [r] = await db.insert(services).values({
    name: s.name,
    description: s.description,
    category: s.category,
    priceCents: s.price_cents,
    durationMinutes: s.duration_minutes,
    isActive: 1,
    displayOrder: s.display_order,
  });
  console.log(`  ✓ service created: ${s.name}`);
  return r.insertId;
}

async function ensureReview(rv) {
  const existing = await db
    .select()
    .from(reviews)
    .where(eq(reviews.customerName, rv.customer_name))
    .limit(1);
  if (existing[0]) {
    console.log(`  · review exists from ${rv.customer_name}`);
    return;
  }
  await db.insert(reviews).values({
    customerId: null,
    bookingId: null,
    customerName: rv.customer_name,
    rating: rv.rating,
    comment: rv.comment,
    serviceName: rv.service_name,
    isPublished: 1,
  });
  console.log(`  ✓ review added from ${rv.customer_name}`);
}

(async () => {
  try {
    console.log('▶ Seeding database…');

    console.log('— Admin —');
    await ensureAdmin();

    console.log('— Barbers —');
    for (const b of BARBERS) await ensureBarber(b);

    console.log('— Services —');
    for (const s of SERVICES) await ensureService(s);

    console.log('— Reviews —');
    for (const rv of REVIEWS) await ensureReview(rv);

    console.log('\n✓ Seed complete.');
    console.log('  Default admin: adminlazybarbers@gmail.com  /  Admin123!');
    console.log('  Default barber password: Barber123!');
  } catch (err) {
    console.error('✗ Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
