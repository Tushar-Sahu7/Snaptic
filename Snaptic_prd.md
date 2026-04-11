**SNAPTIC**

Product Requirements Document

  --------------- -------------------------------------------------------
  Version         1.0

  --------------- -------------------------------------------------------

  --------------- -------------------------------------------------------
  Status          Draft

  --------------- -------------------------------------------------------

  --------------- -------------------------------------------------------
  Platform        Responsive Web App (mobile-first)

  --------------- -------------------------------------------------------

  --------------- -------------------------------------------------------
  Audience        Product Owner · AI Development Agent

  --------------- -------------------------------------------------------

**1. Purpose & Problem**

**1.1 What is Snaptic?**

Snaptic is a face-recognition-powered attendance system built for
teachers who manage classrooms on a daily basis. A teacher opens the
app, points their phone camera around the room, and Snaptic recognises
each student\'s face in real time --- marking them present
automatically. No roll calls. No paper sheets. No manual input unless
the teacher wants it.

**1.2 The Problem**

Taking attendance in a classroom is a daily friction point that
compounds over time. The current approaches each have hard limits:

-   Roll call by name is slow --- a class of 30 takes 5--10 minutes and
    disrupts the lesson flow.

-   Paper sheets are error-prone and require manual data entry to become
    searchable records.

-   Existing digital tools require students to self-report or use
    dedicated hardware (NFC, QR codes), which adds setup cost and
    failure points.

Snaptic removes all of these friction points. The teacher does the work
passively, just by scanning the room. Recognition happens on-device, no
internet latency per face. The record is saved to a database the moment
a face is confirmed.

**1.3 The Opportunity**

Face recognition technology is now accurate and fast enough to run
entirely in the browser on consumer hardware. Combined with a
well-designed mobile-first interface, this makes it possible to build an
attendance tool that is faster than any existing method --- without
requiring institutional infrastructure, dedicated devices, or changes to
student behaviour.

**2. User Personas**

+-----------------------------------------------------------------------+
| **👩‍🏫 The Teacher**                                                    |
|                                                                       |
| *Manages one or more classes. Takes attendance at the start of every  |
| session. May also need to mark students manually when face            |
| recognition fails (poor lighting, student absent during scan).*       |
|                                                                       |
| **Pain** Attendance takes too long and the records are scattered      |
| across paper and spreadsheets.                                        |
|                                                                       |
| **Goal** Start class on time. Have a complete, exportable attendance  |
| record without manual data entry.                                     |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **🎓 The Student**                                                    |
|                                                                       |
| *Enrolled in one or more classes. Has no active role during           |
| attendance --- presence is detected passively. Can view their own     |
| attendance history from their dashboard.*                             |
|                                                                       |
| **Pain** No visibility into their own attendance record until exam    |
| time when it is too late to fix.                                      |
|                                                                       |
| **Goal** Know at a glance which classes they are falling short in so  |
| they can act early.                                                   |
+-----------------------------------------------------------------------+

**3. Feature Scope**

Snaptic is built around six features. Everything outside this list is
explicitly not in scope for this version.

  --------- ------------------------------------- ------------------------
  **\#**    **Feature**                           **User**

  F-1       Authentication --- register, login,   Teacher · Student
            teacher invite flow                   

  F-2       Class Management --- create class,    Teacher
            add students                          

  F-3       Face Enrollment --- student registers Student
            their face                            

  F-4       Take Attendance --- live face         Teacher
            recognition session                   

  F-5       Attendance History --- view past      Teacher · Student
            sessions and records                  

  F-6       Export CSV --- download one session   Teacher
            as a spreadsheet                      
  --------- ------------------------------------- ------------------------

**4. Feature Details**

  -----------------------------------------------------------------------
  **F-1 · Authentication**

  -----------------------------------------------------------------------

**Overview**

Snaptic uses a single registration page for all users. There is no role
selector. Role is assigned automatically: if a user arrives via an
invite link they become a teacher; otherwise they become a student. This
prevents any user from self-assigning a teacher role without a
legitimate invite.

**Registration**

The registration form collects three fields: Full Name, Email, and
Password. That is all. The user\'s name is stored at registration time
--- there is no separate onboarding step to collect it later. If the URL
contains an invite token, a banner is shown indicating the user has been
invited as a Teacher. The invite token is validated server-side before
the account is created.

**Login**

Login requires only Email and Password. There is no role field on the
login screen. The server reads the role from the database and returns it
in the response. The client then redirects to the appropriate dashboard
based on the role it receives. A user cannot manipulate their role by
changing any field on the login form.

**Session Handling**

Authentication state is stored as an HTTP-only cookie set by the server.
The browser attaches this cookie automatically to every request. There
is no token stored in localStorage and no Authorization header managed
by the client. This makes session hijacking significantly harder and
removes all token management from the frontend.

**Teacher Invite Flow**

Any logged-in teacher can generate an invite link from their dashboard.
Tapping the Invite Teacher button opens a modal. The server generates a
one-time token, stores it against the teacher\'s profile with a one-hour
expiry, and returns the full invite URL. The teacher copies or shares
this URL directly from the modal. When a new teacher opens that URL and
registers, the token is validated and immediately wiped --- it can never
be reused. If a teacher generates a new invite link, the previous one is
invalidated instantly since only one token can exist per teacher profile
at a time.

  -- ---------------------------------------------------------------------
     The seeded teacher account is the root of the teacher invite chain.
     It is created once via a seed script during development. All
     subsequent teachers must be invited by an existing teacher. There is
     no public path to a teacher account.

  -- ---------------------------------------------------------------------

**User Stories**

1.  As a student, I can register with my name, email, and password so
    that I have an account in the system.

2.  As a prospective teacher, I can open an invite link and register so
    that I am assigned the teacher role.

3.  As a teacher or student, I can log in with my email and password so
    that I can access my dashboard.

4.  As a teacher, I can generate an invite link so that I can invite
    another teacher to join the system.

5.  As a teacher, I know that generating a new invite invalidates the
    old one so that stale links cannot be misused.

**Acceptance Criteria**

-   Registering without an invite token always results in a student
    account.

-   Registering with a valid, unexpired invite token results in a
    teacher account.

-   A used or expired invite token is rejected with a clear error
    message.

-   Login does not accept a role field from the client --- role is
    always server-determined.

-   The invite modal shows a copy button and a native share button (for
    mobile).

-   Session cookie is HTTP-only and cannot be read by JavaScript.

  -----------------------------------------------------------------------
  **F-2 · Class Management**

  -----------------------------------------------------------------------

**Overview**

Teachers organise their students into classes. Each class has a name, a
schedule, and a roster of students. Classes are the core unit around
which attendance sessions are run.

**Creating a Class**

A teacher can create a class from their dashboard. The required field is
the class name. Optionally the teacher can add a schedule: day of the
week, start time, end time, and room. A class starts with an empty
student roster and no sessions.

**Adding Students**

A teacher can add students to a class by searching within the app. The
search field accepts a student\'s name or roll number. Results show the
student\'s name, roll number, and whether they have enrolled their face.
The teacher taps a student to add them to the class. A student can only
be added once --- duplicate enrollment is rejected. Only users with the
student role can be added to a class.

**User Stories**

6.  As a teacher, I can create a class with a name and schedule so that
    I have a container to add students to.

7.  As a teacher, I can search for registered students by name or roll
    number so that I can build my class roster.

8.  As a teacher, I can see whether a student has enrolled their face so
    that I know who is ready for recognition.

9.  As a teacher, I can see all my classes on my dashboard so that I can
    navigate to them quickly.

**Acceptance Criteria**

-   Class name is required. Schedule is optional.

-   Search is case-insensitive and matches partial names and roll
    numbers.

-   A student cannot be added to the same class twice.

-   Only users with the student role appear in search results.

-   A teacher can only see and manage classes they created.

  -----------------------------------------------------------------------
  **F-3 · Face Enrollment**

  -----------------------------------------------------------------------

**Overview**

Before a student can be recognised during an attendance session, they
must enrol their face. This is a one-time setup done from the student\'s
dashboard. The entire recognition model runs in the browser --- no face
image is sent to the server. Only a mathematical representation of the
face (a descriptor) and a compressed face crop are stored.

**Enrollment Flow**

The student taps the Enrol Face button on their dashboard. The app loads
the face recognition models --- this takes a few seconds on the first
visit but is cached by the browser for all future visits. Once loaded,
the front camera opens with a circular overlay guide. A quality check
runs continuously: it checks that a face is detected, that the
confidence is high, that the face is large enough in frame, and that it
is roughly centred. The overlay border turns green and a Hold Still
message appears when all checks pass. After 1.5 seconds of stable
quality, the capture happens automatically. The student can also tap a
capture button manually. A face descriptor and a compressed face
thumbnail are sent to the server and saved to the student\'s profile.
Face enrollment is now complete and the camera is released.

**Privacy Principles**

The face image captured during enrollment is compressed and stored as a
thumbnail solely for display purposes in the attendance UI. The
mathematical descriptor used for recognition is a 128-number array and
cannot be reversed into a face image. No raw video frames are
transmitted. The student\'s face data is stored only on Snaptic\'s
servers and is used only for attendance recognition within the app.

**User Stories**

10. As a student, I can enrol my face from my dashboard so that I can be
    recognised during attendance.

11. As a student, I receive visual feedback on whether my face is
    positioned correctly so that I know when to hold still.

12. As a student, I can see that my face is enrolled on my dashboard so
    that I know the setup is complete.

**Acceptance Criteria**

-   Face enrollment is available only to students.

-   The camera guide shows green when quality checks pass and red with a
    specific message when they fail.

-   Enrollment only proceeds when all quality checks pass for 1.5
    continuous seconds.

-   After enrollment, the student\'s dashboard shows a face-enrolled
    status indicator.

-   Re-enrollment overwrites the previous descriptor and thumbnail.

  -----------------------------------------------------------------------
  **F-4 · Take Attendance**

  -----------------------------------------------------------------------

**Overview**

This is the core feature of Snaptic. A teacher starts an attendance
session for a class, opens the rear camera, and slowly pans around the
room. The app detects every face in the frame, matches each one against
the enrolled student roster, and marks them present automatically.
Students who are not recognised by the time the session ends are marked
absent.

**Session Start**

Before the camera opens, the app fetches the enrolled face data for
every student in the class and loads the recognition models. These are
two separate loading steps shown to the teacher with progress feedback.
Only one session can be active per class per day --- attempting to start
a duplicate session is rejected with a clear message.

**Recognition Loop**

The recognition loop runs every 500 milliseconds. On each tick it
detects all faces in the current video frame and attempts to match each
one against students who have not yet been confirmed. Three techniques
work together to keep the process efficient and accurate. First, once a
student is confirmed they are removed from the candidate pool --- the
more students are confirmed, the less computation each frame requires,
approaching zero by the end. Second, processing at 2 frames per second
rather than the camera\'s native 30 frames per second eliminates
redundant computation with no loss of accuracy. Third, a position cache
tracks where faces have already been confirmed --- if the same face
position is seen again within 3 seconds, it is skipped entirely, which
handles the teacher zooming in on a group and holding the camera still.

  -- ---------------------------------------------------------------------
     Recognition uses euclidean distance on the 128-float face descriptor.
     A distance below 0.6 is treated as a match. This is a distance score,
     not a similarity score --- lower is a closer match.

  -- ---------------------------------------------------------------------

**Recognition Feedback**

When a student is recognised, a popup appears at the top of the screen
showing the student\'s face thumbnail and name, labelled Recognised. It
dismisses automatically after 2 seconds. If multiple students are
matched in the same frame, the popups queue one after another rather
than stacking. The bottom panel shows two tabs: Confirmed (students
marked present) and Not Yet (students not yet confirmed). The teacher
can monitor both lists in real time.

**Manual Override**

The Not Yet tab shows action buttons next to each student for manual
marking. The teacher can mark a student Present or Absent directly. A
student in the Confirmed tab can also be toggled to Absent manually if
the recognition was incorrect. All manually marked records are flagged
with the method field set to manual rather than face so the distinction
is preserved in the data.

**Ending a Session**

The teacher taps End Session when finished scanning. All students still
in the Not Yet list at that moment are automatically marked absent. The
session is closed and the teacher is taken to a session summary screen
showing total present and total absent counts.

**User Stories**

13. As a teacher, I can start an attendance session for a class so that
    recognition begins.

14. As a teacher, I can pan the rear camera around the room so that all
    students get scanned without any action from them.

15. As a teacher, I see a popup when a student is recognised so that I
    know the system is working.

16. As a teacher, I can manually mark a student present or absent so
    that edge cases are handled.

17. As a teacher, I can end the session so that all remaining students
    are auto-marked absent and the record is saved.

18. As a teacher, I cannot accidentally start two sessions for the same
    class on the same day.

**Acceptance Criteria**

-   Only one active session per class per calendar day.

-   Loading screen shows two distinct steps --- student data fetch and
    model load --- with progress.

-   Recognition runs at 500ms intervals, not on every camera frame.

-   A student already confirmed is never re-processed.

-   Manual marks are stored with method: manual; face marks with method:
    face.

-   Ending a session creates absent records for all unconfirmed students
    in a single operation.

-   Recognition popup auto-dismisses after 2 seconds and does not stack.

  -----------------------------------------------------------------------
  **F-5 · Attendance History**

  -----------------------------------------------------------------------

**Overview**

Both teachers and students can view attendance records. Teachers see the
full history of sessions for their classes. Students see only their own
record. The data is read-only --- editing past records is not supported
in this version.

**Teacher View**

A teacher navigates to a class and taps the History tab. They see a list
of all completed sessions sorted by most recent date, each showing the
date and counts of present and absent students. Tapping a session shows
the full roster for that session with each student\'s status and the
method by which it was recorded.

**Student View**

A student\'s dashboard shows all classes they are enrolled in. Tapping a
class shows a list of attendance dates with their status for each:
present, absent, or late. Records are sorted by most recent date first.

**User Stories**

19. As a teacher, I can see a list of past sessions for a class so that
    I have a complete attendance history.

20. As a teacher, I can tap a session to see each student\'s status so
    that I can review the record.

21. As a student, I can see my own attendance record per class so that I
    know where I stand.

**Acceptance Criteria**

-   Teachers can only view history for classes they own.

-   Students can only view their own records.

-   Sessions are listed in descending date order.

-   Each record shows whether it was marked by face recognition or
    manually.

  -----------------------------------------------------------------------
  **F-6 · Export CSV**

  -----------------------------------------------------------------------

**Overview**

A teacher can export the attendance record for a single session as a CSV
file. This allows the data to be used in external tools such as
spreadsheets or institutional systems without requiring any API
integration.

**Export Format**

Each row in the CSV represents one student in the session. The columns
are: Name, Roll Number, Status, and Method. The file downloads directly
to the device with a filename that includes the session date.

**User Stories**

22. As a teacher, I can tap an export button on a session so that I get
    a CSV file I can use in a spreadsheet.

**Acceptance Criteria**

-   Export is available only on completed sessions.

-   The file contains one row per student with all four columns.

-   The filename includes the session date in a readable format.

-   The download triggers the browser\'s native save dialog.

**5. Key User Flows**

**5.1 New Teacher Onboards**

23. Root teacher logs in and taps Invite Teacher on their dashboard.

24. System generates a one-time link with a one-hour expiry.

25. Teacher copies or shares the link via the modal.

26. Recipient opens the link, sees the Teacher invite banner, fills the
    form, and registers.

27. New teacher is redirected to the teacher dashboard.

**5.2 Student Registers and Enrols**

28. Student opens the registration page without an invite token.

29. Student fills name, email, and password. Account is created with the
    student role.

30. Student is redirected to their dashboard.

31. Student taps Enrol Face, follows the camera guidance, and capture
    happens automatically.

32. Dashboard now shows Face Enrolled status.

**5.3 Teacher Takes Attendance**

33. Teacher taps a class on their dashboard.

34. Teacher taps Start Session.

35. App loads student face data and recognition models --- progress
    shown for each step.

36. Camera opens. Teacher slowly pans around the room.

37. Recognised students move from Not Yet to Confirmed with a popup
    notification.

38. Teacher manually marks any students that were not captured
    automatically.

39. Teacher taps End Session. Remaining students are auto-marked absent.

40. Teacher sees the session summary with present and absent totals.

**6. UI & UX Principles**

**6.1 Mobile-First, Native Feel**

Snaptic is a responsive web app but must feel indistinguishable from a
native mobile app. This means no desktop-style layouts that reflow
awkwardly on small screens. Every screen is designed for one-handed
thumb operation from the start. Desktop users get the same layout, not a
different one.

**6.2 Tap Targets**

Every interactive element must have a minimum tap target of 48 pixels in
height. Primary actions sit at the bottom of the screen where the thumb
naturally rests. Secondary actions are accessible but not competing for
attention.

**6.3 Camera Screens**

Video fills the full screen width with no letterboxing. Controls overlay
at the bottom, never at the top. This keeps the most important part of
the interaction --- the live feed --- fully visible and avoids the
ergonomic strain of reaching to the top of the screen.

**6.4 Loading Screens**

Snaptic has two features that require meaningful loading time: model
loading for face recognition, and student data fetching before a
session. Both must show explicit progress with a description of what is
loading and why. A spinner with no context is not acceptable. Users who
understand what is happening tolerate waits better.

**6.5 Feedback**

Every action must produce an immediate visual response. Recognition
popups appear the instant a face is matched. Error states must be
specific --- not a generic failure message but a precise description of
what went wrong and what the user can do. Buttons show a pressed state.
Forms show inline validation, not after submission.

**6.6 Navigation**

Navigation uses a bottom tab bar rather than a hamburger menu. Back
actions are always reachable. Navigation depth is capped at two levels
--- a dashboard and a detail view. Nothing is buried deeper than two
taps from the dashboard.

**7. Constraints & Assumptions**

**7.1 Constraints**

-   Face recognition runs entirely in the browser. There is no
    server-side vision processing. This means recognition accuracy is
    bounded by what face-api.js can achieve with its TinyFaceDetector
    and FaceRecognitionNet models.

-   Only one face enrollment pose is supported per student. Multi-angle
    enrollment is not in scope for this version.

-   Sessions are one per class per calendar day. Running two sessions
    for the same class on the same day is not supported.

-   The invite link system supports one active invite token per teacher
    at a time. Generating a new invite kills the previous one.

-   CSV export covers one session at a time. Bulk or date-range exports
    are not in scope.

**7.2 Assumptions**

-   Teachers have a smartphone or tablet with a working rear camera to
    use during attendance sessions.

-   Students register themselves --- the system does not support bulk
    import of student accounts.

-   Face enrollment is voluntary from the student\'s perspective in
    terms of scheduling, but functionally required to participate in
    face-recognition attendance. Students who have not enrolled are
    always manually marked.

-   The app is used in environments with sufficient lighting for face
    detection. Performance in very low light is not guaranteed.

-   All users have a stable enough internet connection to load the app
    and sync attendance records. Recognition itself is offline-capable
    once models are cached.

**8. Open Questions**

The following questions are unresolved and should be answered before or
during development:

-   Should students be notified when their attendance is marked --- via
    an in-app notification or dashboard update --- or is the history
    view sufficient?

-   What happens if a student re-enrols their face? The current design
    overwrites the previous descriptor silently. Should there be a
    confirmation step?

-   Is there a need for the teacher to remove a student from a class
    after they have been added? Removing a student with existing
    attendance records raises data integrity questions.

-   Should the invite link expiry be configurable by the teacher, or is
    one hour fixed?

-   Is a late status for attendance needed beyond present and absent,
    and if so what triggers it --- a time threshold or a manual teacher
    action?

Snaptic · PRD v1.0 · Confidential