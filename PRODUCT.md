# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: a pet owner managing their household's pets.** Typically 1–4 pets. They keep medical records so they're ready for vet visits, boarding, sitters and emergencies. The product must stay usable at 20–50 pets (multi-pet homes, fosters) without becoming an operations tool.
- **Receiving end: whoever cares for the pet next.** A new vet, a boarding facility, a sitter or emergency staff. They read the vet summary without any app context or account.

## Product Purpose

Novellia Pets lets owners track and manage their pets' medical records. Success means an owner can:

- see at a glance what care is overdue or due soon across all their pets;
- hand a complete, readable summary of a pet's history to whoever needs it;
- ask plain-language questions about their pets and get grounded answers.

## Positioning

Records that do work instead of sitting in an archive. Due dates turn history into what's next. The vet summary turns history into something you can hand over. Chat turns history into answers.

## Operating Context

- Owners log visits, vaccinations and medications at home. They pull records up at the vet's front desk, at boarding check-in, or for a sitter. _[Inferred: those moments imply phone use.]_
- The vet summary is printed or shown on screen to a third party.
- This MVP is a take-home for Novellia:
  - Reviewers run it locally (`npm run setup`), possibly without an OpenRouter key.
  - The review session includes pairing on one or two new features, so the data model and code boundaries must be explainable and easy to extend.

## Capabilities and Constraints

**Required by the brief**

- Add, view, edit and delete pets.
- Add, view, edit and delete medical records for a pet.
- A dashboard that gives a sense of the state of all pets.
- A way to find or filter pets and records.
- Data persists across page refreshes (SQLite via Kysely).
- No authentication in the MVP; the app acts as a single household (see Decisions). The approach to auth gets discussed in the review.

**Medical record types (MVP)**

- Vaccinations
- Medications
- Vet visits & exams
- Allergies & conditions

Not in the MVP: procedures & surgeries, lab results.

**Features beyond the brief.** These three carry equal weight; this is the owner's decision, not one headline feature with extras.

1. **Due & overdue care.** Vaccinations, medications and checkups carry due dates. The dashboard leads with what's overdue or due soon across all pets.
2. **Vet summary.** One printable summary of a pet's history for a new vet, boarding facility, sitter or emergency room.
3. **Chat agent.**
   - Answers questions about the owner's pets from their records, and also answers general pet-care questions with clear not-a-vet framing.
   - Read-only: it doesn't create or change records.
   - Runs through OpenRouter.
   - When OpenRouter isn't configured, chat doesn't appear anywhere in the UI.

**Terminology:** pet, household, medical record, the record type names above, and the care statuses overdue / due soon / up to date.

**Decisions**

- **Species:** common pets that have an emoji. Each species is shown with its emoji, for delight.
  - Dog 🐶, cat 🐱, rabbit 🐰, hamster 🐹, mouse 🐭, rat 🐀, hedgehog 🦔, bird 🦜, chicken 🐔, fish 🐠, turtle 🐢, lizard 🦎, snake 🐍, horse 🐴.
  - Other 🐾 covers everything else. The free-text breed field then says what the animal is (e.g. guinea pig, ferret).
  - Pets store a stable species id (`dog`, `hedgehog`, `other`…), never the emoji. The emoji is display only and can change without touching data.
  - The species name always appears as text next to the emoji. Screen readers announce emoji by Unicode name ("rabbit face"), and emoji look different on every OS.
  - Species live in a `species` table (id, name, emoji, sort order) filled by the initial migration, and pets reference it by foreign key. Seeds are for fictional development data only, so reference data belongs in migrations; adding a species is a migration that inserts a row.
  - Vaccine schedules aren't encoded per species; that would be a medical claim.
- **Pet profile:** name, species, breed, sex, spayed/neutered, date of birth (optional, since rescues often don't know it), microchip number and notes. No photos in the MVP; uploads need file storage.
- **All medical records share one shape.**
  - Every record has a pet, a type, a title (vaccine, drug, visit reason, or allergy/condition name), the date it happened, an optional end date (medication stopped, condition resolved), an optional due date, and notes.
  - Everything that works across types (due and overdue care, history, active medications and conditions, the vet summary, chat) uses only these shared fields.
- **Type-specific details:**
  - Vaccination: clinic, lot number.
  - Medication: dosage, frequency, prescribed by.
  - Vet visit: clinic, veterinarian, weight.
  - Allergy or condition: which of the two it is, severity, reaction.
  - These are stored as validated JSON next to the shared fields. Record types live in a `medical_record_type` table filled by the initial migration, so a new record type (e.g. lab results) is a migration that inserts a row, plus its details schema and form. Tradeoff: the database can't index or constrain the detail fields.
- **Dates are calendar dates** (`YYYY-MM-DD`), not timestamps, so a record never shifts by a day across time zones.
- **Care status:**
  - **Overdue:** due date before today.
  - **Due soon:** due within the next 30 days. That's enough lead time to book a vet; 7 days is too late to act on and 90 is noise. It's one constant, not a user setting.
  - **Up to date:** nothing overdue or due soon.
  - Only the newest record of a recurring item (same pet, type and title) carries a live due date: logging this year's rabies shot clears last year's. Records that have ended don't produce due items.
  - The UI keeps titles consistent with a "log next dose" action on due items and title suggestions from the pet's past records.
  - A medication's due date is its refill or recheck date, not each dose. Dose reminders need notifications, which are out of scope.
  - "Today" is the server's local date in the MVP. A deployed version would take it from the household's time zone.
- **Find and filter:**
  - Pets: search by name or breed; filter by species and care status; sorted needs-attention first by default.
  - A pet's records: filter by type; search titles and notes.
  - Across pets: the dashboard's due list. No separate global record search in the MVP.
  - Filters live in the URL, so filtered views survive a refresh, work with the back button and can be shared.
- **A household boundary now, auth later.**
  - Pets belong to a household; records belong to pets.
  - All data access is scoped through one current-household lookup. Until auth exists it returns a single default household, created automatically if missing.
  - Adding auth replaces that lookup with a session and adds users and household membership, so a partner or sitter shares pets through membership instead of re-keying data.
  - Chat reads through the same scoped data access.

## Brand Commitments

- The product name is **Novellia Pets** (from the brief).
- No logo, palette, typography or voice guidelines have been provided, and none should be implied.
- The current create-next-app styling (Geist, black/white tokens) is boilerplate, not a commitment.

## Evidence on Hand

- The take-home brief (requirements above). It lives in conversation and isn't committed to the repo.
- There are no real users, pet data, testimonials, vet partners or metrics.
  - Seed and demo data must be clearly fictional.
  - Never claim clinical review, vet partnerships or usage numbers.

## Product Principles

1. **What needs attention comes first.** Overdue and due-soon care outranks history and counts wherever pets are summarized.
2. **Records are written to be handed over.** Every record should make sense to a vet, sitter or boarding desk with no app context. The vet summary is the test.
3. **Chat is useful and honest.**
   - Answers about the owner's pets come from their records and say which records they used.
   - General pet-care answers are framed as general information, not diagnosis.
   - Urgent symptoms point to a vet.
4. **Optional means absent.** A feature that depends on configuration, like chat, disappears entirely when it isn't configured. No disabled states, no teasers.
5. **Household-first, never brittle at dozens.** Designed for a few pets; lists, filters and the dashboard still hold up at 50.
