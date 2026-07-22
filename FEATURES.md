# Smart Academic Timetable Orchestrator – Feature List (Personal / No Roles)

## 1. Upload & Data Handling
- **Drag-and-drop or file browser** upload for `.xlsx` and `.xls` files.
- **Auto-detect file structure** – reads the first row to identify column headers.
- **Intelligent Column Aliasing (Smart Header Matching)**:
  - Automatically maps synonyms to required fields (e.g., `"Subj Code"`, `"Code"`, `"Subject"`, `"Subj. Code"` all map to Subject Code).
  - Supports fuzzy matching for typos (e.g., `"Scheduel"` → `"Schedule"`).
  - Strips case, periods, underscores, and extra spaces for flexible matching.
- **Manual Column Override** – dropdown menus let users reassign columns if the system guesses incorrectly.
- **Unmatched Column Warning** – alerts users to ignored columns (e.g., `"Student Email"`) and asks for confirmation.
- **Fallback Manual Mapping Mode** – if no headers match, prompts the user to map each column manually via dropdowns.
- **Raw data preview table** – shows extracted data before generating the schedule.

---

## 2. Smart Parsing & Conflict Detection
- **Parses messy schedule strings** (e.g., `"1-2:30 pm TTh, 2-4 pm F CCMS-RM-04"`) into structured time/day/room data.
- **Auto-splits multi-session classes** – detects if a class meets on multiple separate day/time blocks.
- **Standardizes time formats** – converts AM/PM to 24-hour internally for accurate calculations.
- **Time conflict detection** – highlights overlapping classes in red.
- **Back-to-back room distance warning** – flags impossible transitions (e.g., 12:00 PM end in Building A → 12:00 PM start in Building B).
- **Duplicate subject detection** – warns if the same subject code appears twice in one semester.
- **Parsing report** – shows exactly which rows failed to parse and why (e.g., missing time, invalid format).

---

## 3. Visual Schedule Generation (Grid)
- **Classic weekly grid view** – days (Mon–Sun) vs. hourly time slots.
- **Smart color assignment**:
  - Generates soft, eye-friendly pastel colors using a perceptually uniform algorithm (OKLCH/HSL).
  - Same subject code always gets the same color across the entire grid.
- **Manual color override** – users can click any class block and change its color with a picker.
- **Live "current time" indicator** – adds a semi-transparent vertical line on the grid.
- **Free period (gap) analysis** – shades gaps differently:
  - Green for "good study breaks" (e.g., 2+ hours).
  - Gray for "dead time" (e.g., 1-hour gaps not worth leaving campus).
- **Day summary tooltip** – hover over any day to see total hours, number of classes, and subjects.

---

## 4. Views & Filters
- **Toggle between Grid View** (visual timetable) and **List View** (chronological text list).
- **Filter by instructor** – show only classes taught by a specific professor.
- **Filter by day** – view a single day's schedule in isolation.
- **Zoom in/out** – adjust grid scale for readability.
- **Instructor Heatmap view** – displays each professor's weekly teaching hours across days (calculated from your uploaded data).

---

## 5. Editing & Personalization
- **Manual time/room/instructor editing** – directly edit any class field on the grid.
- **Add custom events** – insert personal notes (e.g., "Midterm Review", "Doctor's Appointment") onto the timetable.
- **Undo / Redo** – full history stack for all manual changes.
- **Auto-save to browser LocalStorage** – retains schedule on refresh.
- **Revert to original** – one-click reset to the raw uploaded data.

---

## 6. Analytics & Insights
- **Total units calculator** – sums all credits and displays total academic load.
- **Busiest day heatmap** – visually ranks which days have the most class hours.
- **Gap statistics** – calculates and displays:
  - Longest break.
  - Shortest break.
  - Total idle hours per week.
- **Instructor workload bar** – shows total hours per professor across all sections in your file.
- **Schedule Optimizer (Pro advisory)** – suggests moving electives to:
  - Eliminate long gaps.
  - Create a 4-day workweek.
  - Balance daily workload evenly.

---

## 7. Export & Sharing (Optional Supabase Cloud Features)
- **High-resolution PNG export** – downloadable image ready for printing or posting.
- **Print-ready PDF export** – vector-based, crisp text, formatted for A4/Letter.
- **.ics (iCal) export** – one-click import into Google Calendar, Outlook, or Apple Calendar.
- **Batch export (ZIP)** – upload multiple student files (e.g., your own different semester variants) and download all schedules in a single ZIP (processed client-side).
- **Optional Cloud Save** – if you create a free account (Supabase Auth), your schedule is saved to the cloud so you can access it from any device.
- **Shareable public link** – generate a unique URL (e.g., `app.com/schedule/abc123`) to share your schedule with friends or family. They can view it without logging in. No admin oversight—your link, your schedule.

---

## 8. Accessibility & Personalization
- **Colorblind-friendly palette toggle** – switches to a safe Blue/Yellow/Orange palette.
- **High-contrast mode** – for low-vision users.
- **Tooltips on all interactive elements** – explains what each field and button does.
- **Responsive design** – works on desktop, tablet, and mobile browsers.

---

## 9. Error Handling & Support
- **Detailed validation error messages** – clear, human-readable explanations (not stack traces).
- **Parsing success rate indicator** – shows what percentage of rows were successfully interpreted.
- **Auto-suggest fixes** – e.g., *"Did you mean '1-2:30 pm' instead of '1-2:30pm'?"*
- **Crash recovery** – any failure reverts to the last known good state from LocalStorage or cloud backup.

---

## 10. Bonus Advanced Intelligence (Client-Side / Optional)
- **Natural language override** – type commands like *"Move Capstone to Thursday afternoon"* and parse them client-side using a lightweight NLP library (e.g., `compromise`).
- **Exam week stress prediction** – identifies the final week's heaviest days and color-codes stress levels based on the uploaded schedule.
- **Semester timeline bar** – horizontal Gantt-style bar showing the 18-week semester with midterms/finals marked (user manually inputs semester start date).