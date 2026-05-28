-- =============================================================
-- ADD FOREIGN KEY CONSTRAINTS
-- Run this after all tables exist and data is consistent.
-- Drop with remove-foreign-keys.sql (reverses this order).
-- =============================================================

-- 1. barbers.user_id → users.id
--    RESTRICT: a user with a barber profile must be deactivated first
ALTER TABLE barbers
  ADD CONSTRAINT fk_barbers_user_id
  FOREIGN KEY (user_id) REFERENCES users (id)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- 2. barber_schedules.barber_id → barbers.id
--    CASCADE: schedule rows are pure children; delete barber → delete schedule
ALTER TABLE barber_schedules
  ADD CONSTRAINT fk_barber_schedules_barber_id
  FOREIGN KEY (barber_id) REFERENCES barbers (id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- 3. barber_time_off.barber_id → barbers.id
--    CASCADE: time-off requests are pure children of a barber record
ALTER TABLE barber_time_off
  ADD CONSTRAINT fk_barber_time_off_barber_id
  FOREIGN KEY (barber_id) REFERENCES barbers (id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- 4. barber_time_off.reviewed_by → users.id
--    SET NULL: nullable — reviewer user can be deleted without losing the record
ALTER TABLE barber_time_off
  ADD CONSTRAINT fk_barber_time_off_reviewed_by
  FOREIGN KEY (reviewed_by) REFERENCES users (id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- 5. bookings.customer_id → users.id
--    RESTRICT: business record — must not lose booking history on user delete
ALTER TABLE bookings
  ADD CONSTRAINT fk_bookings_customer_id
  FOREIGN KEY (customer_id) REFERENCES users (id)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- 6. bookings.barber_id → barbers.id
--    RESTRICT: business record — bookings must be resolved before barber removal
ALTER TABLE bookings
  ADD CONSTRAINT fk_bookings_barber_id
  FOREIGN KEY (barber_id) REFERENCES barbers (id)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- 7. bookings.service_id → services.id
--    RESTRICT: business record — service must not vanish while bookings reference it
ALTER TABLE bookings
  ADD CONSTRAINT fk_bookings_service_id
  FOREIGN KEY (service_id) REFERENCES services (id)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- 8. bookings.cancelled_by → users.id
--    SET NULL: nullable — who cancelled can be nulled if that user is removed
ALTER TABLE bookings
  ADD CONSTRAINT fk_bookings_cancelled_by
  FOREIGN KEY (cancelled_by) REFERENCES users (id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- 9. payments.booking_id → bookings.id
--    RESTRICT: financial record — never silently delete payment rows
ALTER TABLE payments
  ADD CONSTRAINT fk_payments_booking_id
  FOREIGN KEY (booking_id) REFERENCES bookings (id)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- 10. verification_tokens.user_id → users.id
--     CASCADE: tokens are disposable — delete user → delete their tokens
ALTER TABLE verification_tokens
  ADD CONSTRAINT fk_verification_tokens_user_id
  FOREIGN KEY (user_id) REFERENCES users (id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- 11. reviews.customer_id → users.id
--     SET NULL: nullable — review stays visible even if the account is removed
ALTER TABLE reviews
  ADD CONSTRAINT fk_reviews_customer_id
  FOREIGN KEY (customer_id) REFERENCES users (id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- 12. reviews.booking_id → bookings.id
--     SET NULL: nullable — review survives booking archival / soft-delete
ALTER TABLE reviews
  ADD CONSTRAINT fk_reviews_booking_id
  FOREIGN KEY (booking_id) REFERENCES bookings (id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- 13. notifications.user_id → users.id
--     SET NULL: nullable — keep the audit log row even if the user is gone
ALTER TABLE notifications
  ADD CONSTRAINT fk_notifications_user_id
  FOREIGN KEY (user_id) REFERENCES users (id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- 14. notifications.booking_id → bookings.id
--     SET NULL: nullable — notification record survives booking deletion
ALTER TABLE notifications
  ADD CONSTRAINT fk_notifications_booking_id
  FOREIGN KEY (booking_id) REFERENCES bookings (id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;
