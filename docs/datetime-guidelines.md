# Snaptic Date & Time Handling Guidelines

Strictly follow these rules to maintain timezone consistency and avoid "off-by-one" errors across the Snaptic ecosystem.

## 1. Core Architecture
- **Storage Standard**: Always store in **UTC**. Never store local time (IST) in the database.
- **Reference Timezone**: All scheduling and business logic is anchored to **Asia/Kolkata (IST)**.
- **RRULE Standard**: Follow the industry standard for recurrence rules: **Monday = 0**, Tuesday = 1, ..., Sunday = 6.

## 2. Technical Standards
- **API Format**: Use ISO 8601 strings with the `Z` suffix (e.g., `2026-05-08T10:00:00.000Z`).
- **Database Types**: Use Mongoose `Date` type (stores as UTC ISO).
- **RRULE Serialization**: Ensure the `DTSTART` and `UNTIL` properties in RRULE strings are normalized to UTC.

## 3. Frontend Implementation (`frontend/src/lib/date-utils.js`)
- **Conversion to UTC**: Use `toUTC(date, time)` before sending data to the API. It internally uses `fromZonedTime` with IST context.
- **Displaying IST**: Use `formatIST(utcDate, pattern)` or `toLocal(utcDate)` to convert DB timestamps back to IST for the user.
- **Form Parsing**: Use `parseSchedule(schedule)` to break down an RRULE string into IST components (`startDate`, `startTime`, `endDate`, etc.).
- **Day Selection**: Use `WEEKDAYS` and `WEEKDAYS_SHORT` arrays which are standardized to start on **Monday**.

## 4. Backend Implementation (`backend/src/utils/dateUtils.js`)
- **IST Context**: Use `getNowIST()` to get a Date object representing the current moment in Kolkata.
- **Day Boundaries**: Use `getISTDayBounds(date)` to calculate the UTC `start` and `end` moments of a calendar day in IST. Use these for database queries like "Today's Sessions".
- **Absolute Comparisons**: Compare `new Date()` (Absolute UTC) against stored UTC timestamps for real-time logic (e.g., "is session active?").

## 5. Prohibited Patterns (Red Flags)
- ❌ **`new Date(year, month, day)`**: Never use this constructor for business logic; it relies on the server/browser local clock.
- ❌ **`(+1 % 7)` or `(-1 + 7) % 7`**: No manual index shifting for days. Stick to the **Monday=0** standard.
- ❌ **Storing "09:30" as a string without UTC context**: Time strings must either be part of a UTC-normalized RRULE or combined with a date and converted to UTC ISO.

## 6. AI Agent Workflow
When creating new features involving dates:
1. Identify if the logic is **Display-only** (IST) or **Storage/Calculation** (UTC).
2. Check `date-utils.js` for an existing transformation function.
3. Verify that any day-of-week logic matches the **Monday=0** index.
4. If querying the DB for a specific date, always use bounds generated via `getISTDayBounds`.
