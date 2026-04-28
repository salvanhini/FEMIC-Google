# Security Specification - FEMIC PRO

## Data Invariants
1. All clinical data (patients, appointments, etc.) must belong to a specific User (`userId`).
2. A User can only read or write data that belongs to them (`resource.data.userId == request.auth.uid`).
3. User profiles are restricted: users can only read their own profile, and can only update non-RBAC fields.

## The "Dirty Dozen" Payloads (Attack Vectors)

1. **Identity Spoofing**: Create a patient with `userId` of another user.
2. **Identity Spoofing (Update)**: Change a patient's `userId` to take ownership of it.
3. **Privilege Escalation**: Update own User document to set `role: 'admin'`.
4. **Data Scraping**: List all patients without specifying a `where` clause on `userId`.
5. **Orphaned Writes**: Create an appointment for a `patient_id` that doesn't exist.
6. **Shadow Fields**: Add `isVerified: true` to a patient document.
7. **Type Poisoning**: Send a string for `price` in a Service.
8. **Resource Exhaustion**: Use a 2KB string as a document ID.
9. **State Shortcut**: Update appointment status directly to 'concluido' without being the owner.
10. **PII Leak**: Read another professional's patient list.
11. **Immutability Breach**: Change `created_at` on an existing appointment.
12. **Temporal Integrity**: Set a future date for `created_at` from the client.

## Validation Strategy
- Use `isValidId()` for all path variables.
- Use `isValid[Entity]()` helpers to enforce schema and `userId` binding.
- Use `affectedKeys().hasOnly()` for split update actions.
