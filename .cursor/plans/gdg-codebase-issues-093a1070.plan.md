<!-- 093a1070-257e-45c8-9d59-e16f5d75a707 eba2e262-deef-48b0-a3f4-edae3ffc1549 -->
# Remove Session Room Parameter

## Changes Required

### 1. Update Type Definitions

**lib/db.ts** (line ~34)

- Remove `room: string` from `Session` interface

**lib/data-context-new.tsx** (line ~26)

- Remove `room: string` from `Session` interface

### 2. Update Session Form

**components/admin/session-form.tsx**

- Remove `room` from `formData` state (line ~28)
- Remove the entire room input field section (lines ~129-138)

### 3. Update Display Components

**components/session-card.tsx** (lines ~33-34)

- Remove the MapPin icon and room display from the session card

**app/sessions/[id]/page.tsx** (lines ~82-85)

- Remove the MapPin icon and room display from session detail page

**app/admin/page.tsx** (line ~213)

- Remove the room Badge from the admin sessions list

### 4. Clean Database

**data/gdg.json**

- Remove `room` property from all session objects in the sessions array

### 5. Update Legacy Files (if present)

**scripts/init-db.ts**

- Remove `room` field from any session seeding code (if still present)

**lib/data.ts**

- Remove `room` from Session interface (if file exists)

## Production Readiness Checks

### Pre-Deployment Validation

- Run `npm run build` to ensure TypeScript compilation succeeds
- Check for linter errors with `read_lints`
- Verify JSON validity in `data/gdg.json` after manual edits
- Test that existing sessions display correctly without room field
- Ensure Firebase deployment configuration is compatible

### Post-Implementation Testing

- Verify admin panel can create sessions without room field
- Check that session cards display properly without room info
- Confirm session detail pages work correctly
- Ensure no broken UI elements or missing data

## Implementation Order

1. Update TypeScript interfaces first (prevents type errors)
2. Update form component (remove input field)
3. Update display components (remove visual elements)
4. Clean database JSON file
5. Check and update any legacy files
6. Run production build and fix any errors
7. Verify linter passes
8. Validate final JSON structure

### To-dos

- [ ] Fix critical client-side authentication vulnerability by implementing server-side validation and middleware
- [ ] Update API route handlers to properly await params in Next.js 15
- [ ] Fix speaker.avatar to speaker.image property mismatch in session detail page
- [ ] Add proper await statements in scripts/init-db.ts for all async operations
- [ ] Update dependencies to resolve React 19 conflicts and security vulnerabilities