-- =============================================================
-- REMOVE FOREIGN KEY CONSTRAINTS
-- Reverses add-foreign-keys.sql — drop in reverse order to
-- respect any inter-FK dependencies.
-- =============================================================

-- 14. notifications.booking_id
ALTER TABLE notifications
  DROP FOREIGN KEY fk_notifications_booking_id;

-- 13. notifications.user_id
ALTER TABLE notifications
  DROP FOREIGN KEY fk_notifications_user_id;

-- 12. reviews.booking_id
ALTER TABLE reviews
  DROP FOREIGN KEY fk_reviews_booking_id;

-- 11. reviews.customer_id
ALTER TABLE reviews
  DROP FOREIGN KEY fk_reviews_customer_id;

-- 10. verification_tokens.user_id
ALTER TABLE verification_tokens
  DROP FOREIGN KEY fk_verification_tokens_user_id;

-- 9. payments.booking_id
ALTER TABLE payments
  DROP FOREIGN KEY fk_payments_booking_id;

-- 8. bookings.cancelled_by
ALTER TABLE bookings
  DROP FOREIGN KEY fk_bookings_cancelled_by;

-- 7. bookings.service_id
ALTER TABLE bookings
  DROP FOREIGN KEY fk_bookings_service_id;

-- 6. bookings.barber_id
ALTER TABLE bookings
  DROP FOREIGN KEY fk_bookings_barber_id;

-- 5. bookings.customer_id
ALTER TABLE bookings
  DROP FOREIGN KEY fk_bookings_customer_id;

-- 4. barber_time_off.reviewed_by
ALTER TABLE barber_time_off
  DROP FOREIGN KEY fk_barber_time_off_reviewed_by;

-- 3. barber_time_off.barber_id
ALTER TABLE barber_time_off
  DROP FOREIGN KEY fk_barber_time_off_barber_id;

-- 2. barber_schedules.barber_id
ALTER TABLE barber_schedules
  DROP FOREIGN KEY fk_barber_schedules_barber_id;

-- 1. barbers.user_id
ALTER TABLE barbers
  DROP FOREIGN KEY fk_barbers_user_id;
