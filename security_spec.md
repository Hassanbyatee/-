# Security Specification & Threat Model — Masar Iraq

## 1. Core Data Invariants
1. **Unapproved Drivers Cannot Publish Trips**: A trip document in `/trips/{tripId}` can only be created if `/drivers/{request.auth.uid}` exists and has `verificationStatus == 'approved'`.
2. **No Self-Assigned Roles or Privilege Escalation**: Users creating `/users/{uid}` may only choose `role in ['passenger', 'driver']` (never `'admin'`), and `accountStatus` must be `'active'`. Updates by non-admins cannot alter `role` or `accountStatus`.
3. **PII Isolation**: Sensitive PII (`email`, `phone`) is stored in `/users/{uid}/private/info` readable only by `isOwner(uid)` or `isAdmin()`.
4. **Atomic Seat Reservation & Anti-Overbooking**: `trips/{tripId}.availableSeats` can never become negative (`>= 0`) and cannot exceed `totalSeats`. Critical trip fields (`pricePerSeatIqd`, `departureGovId`, `destinationGovId`, `departureDate`) cannot be changed by a driver once `confirmedSeatsCount > 0`.
5. **Loyalty Points & Referral Anti-Fraud**: A passenger cannot directly credit their own `/points_wallets/{uid}` or create `earn_trip` / `referral_bonus` transactions. Points are only credited atomically alongside a legitimate `accepted -> completed` booking transition by the trip's approved driver (verified with `getAfter()`), or by `isAdmin()`. Self-referrals (`referrerId == refereeId`) are blocked.
6. **Verified Reviews Only**: A review in `/reviews/{bookingId}` can only be created by the booking's `passengerId` when `/bookings/{bookingId}.status == 'completed'` and `reviewSubmitted == false`, using deterministic document ID `bookingId` to block duplicate reviews.
7. **Cash Payment Integrity**: Only the assigned driver, the passenger (solely for raising a dispute), or an admin may update `/payments/{paymentId}` via strict `affectedKeys().hasOnly(...)` action branches.
8. **Empty-Car Full-Car Booking Integrity**: Full-car bookings (`isFullCar == true`) require `availableSeats == totalSeats`, `confirmedSeatsCount == 0`, an empty `bookedSeats` array, `fullCarPriceIqd > 0`, `seatsCount == totalSeats`, and `totalPriceIqd == fullCarPriceIqd + cargoFee + dropOffFee`.
9. **Weekly Driver Commission Integrity**: Drivers submitting `/driver_weekly_fees/{driverId}_{weekKey}` can only create `pending` submissions with `amountIqd == 20000` and `rafidainNumber == '07738235028'`; only `isAdmin()` may transition `status` to `'approved'` or `'rejected'`.

## 2. Dirty Dozen Attack Payloads (Expected: PERMISSION_DENIED)
1. **Role Escalation on User Create**: `{ uid: "attacker", role: "admin", ... }` -> Denied (`role` restricted to `passenger|driver`).
2. **Shadow Field Injection on User Update**: `{ ...validUser, isAdmin: true }` -> Denied (`hasOnly` & `affectedKeys().hasOnly` blocks unknown fields).
3. **Unverified Driver Publishing Trip**: Unapproved driver calls `setDoc(doc(db, 'trips', 't1'), ...)` -> Denied (`drivers/{uid}.verificationStatus == 'approved'` fails).
4. **Overbooking / Negative Seats on Trip**: Driver sets `availableSeats: -2` -> Denied (`availableSeats >= 0`).
5. **Self-Crediting Loyalty Wallet**: Passenger updates `/points_wallets/{uid}` `balance: 999999` -> Denied (requires `getAfter` booking completion by driver or `isAdmin()`).
6. **Duplicate Review Injection**: Passenger tries creating `/reviews/booking1_dup` for already reviewed booking -> Denied (`reviewId == bookingId` + `!exists()`).
7. **Reviewing Uncompleted Booking**: Passenger tries creating `/reviews/pendingBookingId` -> Denied (`booking.status == 'completed'` fails).
8. **Self-Referral Abuse**: Creating `/referrals/r1` with `referrerId == request.auth.uid && refereeId == request.auth.uid` -> Denied (`referrerId != refereeId`).
9. **Reading Another User's Private PII**: Passenger B calls `getDoc(doc(db, 'users', 'passengerA', 'private', 'info'))` -> Denied (`isOwner` fails).
10. **Blanket Scraping of Bookings**: User queries `collection(db, 'bookings')` without filtering by `passengerId` or `driverId` -> Denied (`allow list` requires `resource.data.passengerId == request.auth.uid || resource.data.driverId == request.auth.uid || isAdmin()`).
11. **Mutating Price After Confirmed Bookings**: Driver updates `pricePerSeatIqd` when `existing().confirmedSeatsCount > 0` -> Denied.
12. **Resource Poisoning via Oversized ID / String**: Creating a trip with a 2KB `tripId` or 10KB `notes` -> Denied (`isValidId` <= 128 chars, `notes.size() <= 400`).
13. **Driver Self-Approving Weekly Fee**: Driver creates/updates `/driver_weekly_fees/{uid}_2026-W48` with `status: 'approved'` -> Denied (`status == 'pending'` enforced for non-admins).
