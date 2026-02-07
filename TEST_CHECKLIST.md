# Job Tracker - Local Testing Checklist

Use this checklist to verify that all core functionality works correctly after setup.

---

## Pre-Testing Setup

### 1. Verify Installation

```bash
# Check Node.js version (should be 18.17+)
node --version

# Verify dependencies are installed
npm list --depth=0
```

### 2. Verify Database Connection

```bash
# Test database connection
npm run prisma:studio
# Should open http://localhost:5555 without errors
# Close it after verification (Ctrl+C)
```

### 3. Start Development Server

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 16.1.6
- Local:        http://localhost:3000
✓ Ready in 2-3s
```

---

## Testing Checklist

### ✅ Authentication & Authorization

#### Test 1: Sign Up
- [ ] Go to http://localhost:3000/signup
- [ ] Enter email: `test1@example.com`
- [ ] Enter password: `password123`
- [ ] Click "Sign up"
- [ ] Should redirect to `/` (home page)
- [ ] No error messages

#### Test 2: Sign Out
- [ ] Click user menu (top right)
- [ ] Click "Sign out"
- [ ] Should redirect to `/signin`

#### Test 3: Sign In
- [ ] Go to http://localhost:3000/signin
- [ ] Enter email: `test1@example.com`
- [ ] Enter password: `password123`
- [ ] Click "Sign in"
- [ ] Should redirect to `/` (home page)

#### Test 4: Demo Account
- [ ] Sign out
- [ ] Go to `/signin`
- [ ] Click "Demo Account" button
- [ ] Should instantly sign in with sample data
- [ ] Should see jobs, applications, etc. already populated

#### Test 5: Protected Routes
- [ ] Sign out
- [ ] Try to access `/jobs` directly
- [ ] Should redirect to `/signin?callbackUrl=/jobs`
- [ ] After signing in, should return to `/jobs`

---

### ✅ Jobs Page

#### Test 6: View Jobs Page
- [ ] Go to `/jobs` page
- [ ] Page loads without errors
- [ ] Shows "Import from Remotive" button
- [ ] Shows filters section

#### Test 7: Import Jobs (Remotive)
- [ ] Click "Import from Remotive"
- [ ] Wait 3-5 seconds
- [ ] Should see success message
- [ ] Jobs list should populate with 20+ jobs
- [ ] Each job shows: title, company, location, work mode

#### Test 8: Filter Jobs
- [ ] In the search box, type "engineer"
- [ ] Select "Remote" from work mode dropdown
- [ ] Click "Apply" button
- [ ] Results should filter to show only remote engineering jobs
- [ ] Clear filters (remove search term, select "Any work mode")
- [ ] Should show all jobs again

#### Test 9: Track a Job
- [ ] Find any job in the list
- [ ] Click "Track" button
- [ ] Should see success message or visual feedback
- [ ] Go to `/applications` page
- [ ] Job should appear in "Interested" column

#### Test 10: Score Jobs (Manual)
- [ ] First, go to `/profile` and add some skills:
  - TypeScript, React, Node.js
- [ ] Go back to `/jobs`
- [ ] Click "Score" button on a single job
- [ ] Wait 2-3 seconds
- [ ] Match score should appear (0-100 range)

#### Test 11: Score All Jobs (Bulk)
- [ ] Go to `/jobs`
- [ ] Click "Score All Jobs" button (at top)
- [ ] Wait 10-30 seconds (depending on number of jobs)
- [ ] Refresh page
- [ ] All jobs should now show match scores

---

### ✅ Applications Page

#### Test 12: View Applications Board
- [ ] Go to `/applications` page
- [ ] Should see kanban board with columns:
  - Interested
  - Applied
  - Recruiter Screen
  - Interview
  - Offer
  - Closed
- [ ] Each application shows: job title, company name

#### Test 13: Move Application Between Stages
- [ ] Find an application in "Interested" column
- [ ] Drag it to "Applied" column
- [ ] Application should move
- [ ] Refresh page
- [ ] Application should still be in "Applied" column

#### Test 14: Set Follow-Up Date
- [ ] Click on any application card
- [ ] Should navigate to `/applications/[id]`
- [ ] Find "Next follow-up" date field
- [ ] Set date to tomorrow
- [ ] Save (form should auto-submit on change)
- [ ] Go back to `/applications`
- [ ] Check "Follow-up queue" card
- [ ] Application should appear in the queue

#### Test 15: Application Details
- [ ] Go to `/applications`
- [ ] Click any application card
- [ ] Should see full application details:
  - Job title and company
  - Application stage
  - Follow-up date
  - Notes section
  - Job deep dive panel
  - LinkedIn panel

---

### ✅ Profile & Skills

#### Test 16: Update Profile
- [ ] Go to `/profile` page
- [ ] Fill in profile fields:
  - Headline: "Senior Software Engineer"
  - Location: "San Francisco, CA"
  - Desired titles: "Senior Engineer, Staff Engineer"
  - Salary range: 150000 - 250000
- [ ] Click "Save Profile"
- [ ] Should see success message
- [ ] Refresh page
- [ ] Data should persist

#### Test 17: Add Skills
- [ ] On `/profile` page
- [ ] In skills section, add a new skill:
  - Name: "Python"
  - Level: 4 (slider)
  - Years: 5
  - Core skill: checked
- [ ] Click "Add Skill"
- [ ] Skill should appear in skills list
- [ ] Should persist after page refresh

#### Test 18: Delete Skill
- [ ] Find a skill in the list
- [ ] Click delete/remove button
- [ ] Skill should be removed
- [ ] Should persist after page refresh

---

### ✅ Network & Contacts

#### Test 19: View Network Page
- [ ] Go to `/network` page
- [ ] Page loads without errors
- [ ] Shows contacts list (empty if new account)
- [ ] Shows import buttons

#### Test 20: Add Contact Manually
- [ ] On `/network` page
- [ ] If there's a form or "Add Contact" button, click it
- [ ] Fill in contact details:
  - Name: "John Doe"
  - Company: "TechCorp"
  - Email: "john@techcorp.example.com"
- [ ] Save
- [ ] Contact should appear in list

---

### ✅ Outreach

#### Test 21: View Outreach Page
- [ ] Go to `/outreach` page
- [ ] Page loads without errors
- [ ] Shows email composer interface

#### Test 22: Draft Email (if OpenAI configured)
- [ ] Select an application from dropdown
- [ ] Choose email tone (Warm/Neutral/Direct)
- [ ] Click "Generate Draft"
- [ ] Wait 3-5 seconds
- [ ] Email draft should appear in the text area
- [ ] Should be customized based on job and profile

**Note:** If `OPENAI_API_KEY` is not set, this will show an error. That's expected.

---

### ✅ Settings

#### Test 23: Export Data
- [ ] Go to `/settings` page
- [ ] Click "Export All Data" button
- [ ] Should download a JSON file
- [ ] Open the JSON file
- [ ] Should contain your jobs, applications, profile, skills, etc.

#### Test 24: Import Data (Optional)
- [ ] On `/settings` page
- [ ] Click "Import Data"
- [ ] Upload the JSON file you just exported
- [ ] Should see success message
- [ ] Data should be imported (duplicates may be skipped)

---

### ✅ AI Features (Optional - Requires OpenAI API Key)

**Prerequisites:** Add `OPENAI_API_KEY=sk-...` to your `.env` file and restart dev server.

#### Test 25: Company Fit Analysis
- [ ] Go to `/jobs` page
- [ ] Click "Company Fit" button on any job
- [ ] Wait 5-10 seconds
- [ ] Should see AI analysis:
  - Company summary
  - How you can help
  - Culture signals
  - Interview angles

#### Test 26: Job Deep Dive
- [ ] Go to `/jobs` page
- [ ] Click "Deep Dive" button on any job
- [ ] Wait 5-10 seconds
- [ ] Should see detailed analysis:
  - Your strengths for this role
  - Potential gaps
  - Skills to highlight
  - Interview preparation tips

#### Test 27: LinkedIn Message Draft
- [ ] Go to an application detail page: `/applications/[id]`
- [ ] In the LinkedIn panel, click "Generate Message"
- [ ] Wait 3-5 seconds
- [ ] Should see a customized LinkedIn message draft
- [ ] Message should mention specific job and company

---

### ✅ Gmail Integration (Optional - Requires Google OAuth)

**Prerequisites:** Set up Google OAuth credentials and add to `.env`:
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

#### Test 28: Connect Gmail Account
- [ ] Go to `/settings` or wherever OAuth link is
- [ ] Click "Connect Google Account"
- [ ] Complete Google OAuth flow
- [ ] Should return to app with account connected

#### Test 29: Send Email
- [ ] Go to `/outreach` page
- [ ] Compose an email
- [ ] Enter recipient email
- [ ] Click "Send via Gmail"
- [ ] Should send successfully
- [ ] Check recipient's inbox to verify

---

### ✅ Error Handling

#### Test 30: Invalid Login
- [ ] Sign out
- [ ] Go to `/signin`
- [ ] Enter invalid credentials
- [ ] Click "Sign in"
- [ ] Should show error message
- [ ] Should NOT crash or redirect

#### Test 31: Protected API Route
- [ ] Sign out
- [ ] Try to call API directly:
  ```bash
  curl http://localhost:3000/api/jobs/score
  ```
- [ ] Should return 401 Unauthorized error

#### Test 32: Invalid Input
- [ ] Try to create an application with invalid data
- [ ] Should show validation error
- [ ] Should NOT crash the app

---

### ✅ Performance & UI

#### Test 33: Page Load Times
- [ ] All pages should load in < 3 seconds
- [ ] No loading spinners that hang indefinitely
- [ ] Images load properly

#### Test 34: Responsive Design
- [ ] Resize browser window to mobile size (375px width)
- [ ] All pages should remain usable
- [ ] Navigation should work (hamburger menu if applicable)
- [ ] Forms should be accessible

#### Test 35: Browser Console
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab
- [ ] Should have no critical errors (red messages)
- [ ] Warnings are acceptable

---

## Verification Summary

After completing all tests, verify:

- [ ] All core CRUD operations work (Create, Read, Update, Delete)
- [ ] Authentication and authorization work correctly
- [ ] Database operations persist correctly
- [ ] No critical errors in browser console
- [ ] Application remains responsive throughout testing
- [ ] Data exports/imports work correctly

---

## Common Issues & Solutions

### Issue: Jobs won't import from Remotive
**Solution:**
- Check internet connection
- Verify API endpoint is accessible
- Check browser console for specific error

### Issue: Match scoring doesn't work
**Solution:**
- Ensure profile and skills are filled in
- Check that jobs have descriptions
- Verify no database errors in terminal

### Issue: Can't drag applications between stages
**Solution:**
- Try refreshing the page
- Check browser console for JavaScript errors
- Verify you're using a modern browser (Chrome, Firefox, Safari, Edge)

### Issue: AI features return errors
**Solution:**
- Verify `OPENAI_API_KEY` is set in `.env`
- Restart dev server after adding key
- Check OpenAI API key has sufficient credits
- Verify key hasn't been revoked

---

## Test Data Cleanup

After testing, if you want a fresh start:

```bash
# Option 1: Reset entire database
npx prisma migrate reset

# Option 2: Delete test user only (via Prisma Studio)
npm run prisma:studio
# Navigate to User table, delete test users manually
```

---

## Reporting Issues

If any test fails:

1. Note which test failed
2. Copy error message from browser console
3. Copy error message from terminal
4. Note the steps to reproduce
5. Check `AUDIT_FINDINGS.md` for known issues
6. Report to development team or GitHub Issues

---

**Testing Complete! 🎉**

If all core tests pass, your Job Tracker installation is working correctly and ready for use.
