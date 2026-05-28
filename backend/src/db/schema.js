/**
 * Drizzle ORM schema — MySQL 8
 *
 * All datetimes are TIMESTAMP columns stored in UTC. The mysql2 driver is
 * configured (in src/config/db.js) with `dateStrings: true` so we always
 * receive ISO-style strings on read, never JS Date objects with timezone
 * surprises.
 *
 * Naming: snake_case columns to match the rest of the API contract; the
 * Drizzle keys themselves are camelCase so JS code reads naturally.
 */

const {
  mysqlTable,
  int,
  varchar,
  text,
  tinyint,
  decimal,
  timestamp,
  uniqueIndex,
  index,
  primaryKey,
  mysqlEnum,
} = require('drizzle-orm/mysql-core');

const { sql } = require('drizzle-orm');

// =============================================================
// USERS — all accounts (customer, barber, admin)
// =============================================================
const users = mysqlTable(
  'users',
  {
    id: int('id').autoincrement().primaryKey(),
    firstName: varchar('first_name', { length: 80 }).notNull(),
    lastName: varchar('last_name', { length: 80 }).notNull(),
    email: varchar('email', { length: 191 }).notNull(),
    phone: varchar('phone', { length: 32 }),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: mysqlEnum('role', ['customer', 'barber', 'admin']).notNull(),
    emailVerified: tinyint('email_verified').notNull().default(0),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex('users_email_unique').on(t.email),
    roleIdx: index('users_role_idx').on(t.role),
  })
);

// =============================================================
// BARBERS — extended profile for users with role='barber'
// =============================================================
const barbers = mysqlTable(
  'barbers',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id').notNull(),
    specialty: varchar('specialty', { length: 120 }),
    bio: text('bio'),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    rating: decimal('rating', { precision: 3, scale: 2 }).notNull().default('0.00'),
    reviewCount: int('review_count').notNull().default(0),
    status: mysqlEnum('status', ['active', 'on_leave', 'inactive']).notNull().default('active'),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow(),
  },
  (t) => ({
    userIdx: uniqueIndex('barbers_user_unique').on(t.userId),
    statusIdx: index('barbers_status_idx').on(t.status),
  })
);

// =============================================================
// BARBER_SCHEDULES — weekly working hours per barber
// day_of_week: 0=Sun, 6=Sat
// =============================================================
const barberSchedules = mysqlTable(
  'barber_schedules',
  {
    barberId: int('barber_id').notNull(),
    dayOfWeek: tinyint('day_of_week').notNull(),
    startTime: varchar('start_time', { length: 5 }).notNull(),
    endTime: varchar('end_time', { length: 5 }).notNull(),
    isWorking: tinyint('is_working').notNull().default(1),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.barberId, t.dayOfWeek] }),
  })
);

// =============================================================
// BARBER_TIME_OFF
// =============================================================
const barberTimeOff = mysqlTable(
  'barber_time_off',
  {
    id: int('id').autoincrement().primaryKey(),
    barberId: int('barber_id').notNull(),
    startDate: varchar('start_date', { length: 10 }).notNull(), // 'YYYY-MM-DD'
    endDate: varchar('end_date', { length: 10 }).notNull(),
    reason: varchar('reason', { length: 500 }),
    status: mysqlEnum('status', ['pending', 'approved', 'denied']).notNull().default('pending'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    reviewedAt: timestamp('reviewed_at'),
    reviewedBy: int('reviewed_by'),
  },
  (t) => ({
    barberIdx: index('time_off_barber_idx').on(t.barberId, t.startDate, t.endDate),
  })
);

// =============================================================
// SERVICES
// =============================================================
const services = mysqlTable(
  'services',
  {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 80 }),
    priceCents: int('price_cents').notNull(),
    durationMinutes: int('duration_minutes').notNull(),
    isActive: tinyint('is_active').notNull().default(1),
    displayOrder: int('display_order').notNull().default(0),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow(),
  },
  (t) => ({
    activeIdx: index('services_active_idx').on(t.isActive),
  })
);

// =============================================================
// BOOKINGS — the core table
// start_at / end_at are TIMESTAMP (UTC). Range queries are correct.
// =============================================================
const bookings = mysqlTable(
  'bookings',
  {
    id: int('id').autoincrement().primaryKey(),
    reference: varchar('reference', { length: 24 }).notNull(),
    customerId: int('customer_id').notNull(),
    barberId: int('barber_id').notNull(),
    serviceId: int('service_id').notNull(),
    startAt: timestamp('start_at').notNull(),
    endAt: timestamp('end_at').notNull(),
    status: mysqlEnum('status', [
      'pending',
      'confirmed',
      'completed',
      'cancelled',
      'no_show',
    ]).notNull().default('confirmed'),
    paymentMethod: mysqlEnum('payment_method', ['online', 'counter']).notNull().default('counter'),
    paymentStatus: mysqlEnum('payment_status', ['unpaid', 'paid', 'refunded']).notNull().default('unpaid'),
    priceCents: int('price_cents').notNull(),
    notes: text('notes'),
    cancelledAt: timestamp('cancelled_at'),
    cancelledBy: int('cancelled_by'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow(),
  },
  (t) => ({
    refIdx: uniqueIndex('bookings_reference_unique').on(t.reference),
    // Critical index for the overlap-check query.
    barberTimeIdx: index('bookings_barber_time_idx').on(t.barberId, t.startAt, t.endAt),
    customerIdx: index('bookings_customer_idx').on(t.customerId),
    statusIdx: index('bookings_status_idx').on(t.status),
  })
);

// =============================================================
// PAYMENTS
// =============================================================
const payments = mysqlTable(
  'payments',
  {
    id: int('id').autoincrement().primaryKey(),
    bookingId: int('booking_id').notNull(),
    transactionId: varchar('transaction_id', { length: 64 }).notNull(),
    amountCents: int('amount_cents').notNull(),
    method: mysqlEnum('method', ['online', 'counter']).notNull(),
    status: mysqlEnum('status', ['succeeded', 'failed', 'refunded']).notNull().default('succeeded'),
    cardLast4: varchar('card_last4', { length: 4 }),
    processedAt: timestamp('processed_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    txIdx: uniqueIndex('payments_tx_unique').on(t.transactionId),
    bookingIdx: index('payments_booking_idx').on(t.bookingId),
  })
);

// =============================================================
// VERIFICATION_TOKENS — email verify + password reset
// =============================================================
const verificationTokens = mysqlTable(
  'verification_tokens',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id').notNull(),
    token: varchar('token', { length: 16 }).notNull(),
    type: mysqlEnum('type', ['email_verify', 'password_reset']).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    userTypeIdx: index('vt_user_type_idx').on(t.userId, t.type),
  })
);

// =============================================================
// CONTACT_MESSAGES
// =============================================================
const contactMessages = mysqlTable('contact_messages', {
  id: int('id').autoincrement().primaryKey(),
  fullName: varchar('full_name', { length: 120 }).notNull(),
  email: varchar('email', { length: 191 }).notNull(),
  phone: varchar('phone', { length: 32 }),
  subject: varchar('subject', { length: 200 }),
  message: text('message').notNull(),
  isRead: tinyint('is_read').notNull().default(0),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// =============================================================
// REVIEWS
// =============================================================
const reviews = mysqlTable(
  'reviews',
  {
    id: int('id').autoincrement().primaryKey(),
    customerId: int('customer_id'),
    bookingId: int('booking_id'),
    customerName: varchar('customer_name', { length: 120 }).notNull(),
    rating: tinyint('rating').notNull(),
    comment: text('comment').notNull(),
    serviceName: varchar('service_name', { length: 120 }),
    isPublished: tinyint('is_published').notNull().default(1),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    publishedIdx: index('reviews_published_idx').on(t.isPublished, t.createdAt),
  })
);

// =============================================================
// NOTIFICATIONS — audit log of every simulated SMS/email
// =============================================================
const notifications = mysqlTable(
  'notifications',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id'),
    bookingId: int('booking_id'),
    channel: mysqlEnum('channel', ['sms', 'email']).notNull(),
    recipient: varchar('recipient', { length: 255 }).notNull(),
    subject: varchar('subject', { length: 255 }),
    body: text('body').notNull(),
    provider: varchar('provider', { length: 32 }).notNull().default('console'),
    status: mysqlEnum('status', ['sent', 'failed', 'queued']).notNull().default('sent'),
    error: text('error'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    createdIdx: index('notifications_created_idx').on(t.createdAt),
  })
);

// =============================================================
// CLUB_MEMBERS — email signup for exclusive deals
// =============================================================
const clubMembers = mysqlTable(
  'club_members',
  {
    id: int('id').autoincrement().primaryKey(),
    email: varchar('email', { length: 191 }).notNull(),
    firstName: varchar('first_name', { length: 80 }),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    emailIdx: uniqueIndex('club_members_email_unique').on(t.email),
  })
);

// =============================================================
// BOOKING_COUNTERS — atomic per-year sequence for booking refs
// =============================================================
const bookingCounters = mysqlTable('booking_counters', {
  year: int('year').primaryKey(),
  value: int('value').notNull().default(0),
});

// =============================================================
// AUDIT_LOGS — immutable trail of key system actions
// =============================================================
const auditLogs = mysqlTable(
  'audit_logs',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id'),
    action: varchar('action', { length: 80 }).notNull(),
    entityType: varchar('entity_type', { length: 80 }),
    entityId: int('entity_id'),
    details: text('details'),
    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    createdIdx: index('audit_logs_created_idx').on(t.createdAt),
    userIdx: index('audit_logs_user_idx').on(t.userId),
    actionIdx: index('audit_logs_action_idx').on(t.action),
  })
);

module.exports = {
  users,
  barbers,
  barberSchedules,
  barberTimeOff,
  services,
  bookings,
  payments,
  verificationTokens,
  contactMessages,
  reviews,
  notifications,
  clubMembers,
  bookingCounters,
  auditLogs,
};
