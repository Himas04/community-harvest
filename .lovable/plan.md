
# Comprehensive Feature Implementation Plan for LeftoverLove

## Overview
This plan covers all 11 truly missing features, organized into implementation phases by priority and dependency. Features already built (search/filter, map view, ratings, receiver dashboard food display) are excluded.

---

## Phase 1: Quick Wins (Immediate Impact, Low Effort)

### 1.1 Auth-Based Homepage Redirect (Item #19)
**Problem:** "Get Started" and "Join Now" buttons always link to `/signup`, even for logged-in users.

**Solution:**
- Update `Index.tsx` to use `useAuth()` hook
- If user is authenticated, redirect CTA buttons to their role-based dashboard (`/dashboard/donor`, `/dashboard/receiver`, `/dashboard/volunteer`)
- Change button text from "Get Started" to "Go to Dashboard" when logged in

### 1.2 Forgot/Reset Password (Item #12)
**Problem:** No password recovery flow exists.

**Solution:**
- Add "Forgot password?" link on `Login.tsx`
- Create `ForgotPassword.tsx` page at `/forgot-password`
- Uses `supabase.auth.resetPasswordForEmail()` with redirect to `/reset-password`
- Create `ResetPassword.tsx` page that calls `supabase.auth.updateUser({ password })`
- Add routes in `App.tsx`

### 1.3 Dark Mode Toggle (Item #16)
**Problem:** `next-themes` is installed but not wired up.

**Solution:**
- Wrap app with `ThemeProvider` in `App.tsx`
- Add `Sun/Moon` toggle button in `Navbar.tsx`
- Ensure `html` element uses `class` strategy (already configured in Tailwind)

### 1.4 Profile Avatar Upload (Item #17)
**Problem:** `avatar_url` column exists but no upload UI.

**Solution:**
- Create storage bucket `avatars` (public)
- Add avatar upload component on `Profile.tsx` with image cropping preview
- Upload to storage, save URL to `profiles.avatar_url`
- Display avatar in Navbar and profile pages using the Avatar component

---

## Phase 2: Core Food Safety Features

### 2.1 Food Expiry System (Items #1, #2)
**Problem:** No expiry tracking -- food can go bad without warning.

**Database Changes:**
- Add `expires_at` (timestamptz, nullable) column to `food_listings`
- Add `expired` value to `listing_status` enum
- Create a database function `archive_expired_listings()` that updates status to `expired` for listings past their expiry
- Create a `pg_cron` or application-level check to run periodically (since pg_cron isn't available, we'll check on page load)

**Frontend Changes:**
- Add date/time picker for expiry on `CreateListing.tsx` and `EditListing.tsx`
- Show expiry badge on listing cards (green = fresh, yellow = expiring soon within 24h, red = expired)
- Filter out expired listings from Browse page by default
- Add expiry warning notifications

### 2.2 Food Categories & Tags (Item #5)
**Problem:** No way to categorize food or filter by dietary needs.

**Database Changes:**
- Create `food_category` enum: `cooked`, `raw`, `packaged`, `baked`, `beverages`, `other`
- Create `dietary_tags` text array or a separate tags table
- Add `category` column (food_category enum) and `dietary_tags` (text[]) to `food_listings`

**Frontend Changes:**
- Add category dropdown and dietary tag checkboxes on Create/Edit listing forms
- Add category and dietary filters on `BrowseFood.tsx`
- Display category badges and dietary tags on listing cards and detail page
- Predefined dietary tags: Vegetarian, Vegan, Halal, Kosher, Gluten-Free, Dairy-Free, Nut-Free

---

## Phase 3: Admin Power Features

### 3.1 User Ban/Suspend System (Item #13)
**Problem:** Admins can change roles but cannot ban problematic users.

**Database Changes:**
- Add `is_banned` (boolean, default false) and `ban_reason` (text, nullable) columns to `profiles`
- Update RLS policies to deny access for banned users
- Create a database function `check_user_banned()` used in RLS

**Frontend Changes:**
- Add Ban/Unban buttons in Admin Dashboard Users tab
- Ban dialog with reason input
- Show banned status indicator
- Blocked users see a "Your account has been suspended" message on login

### 3.2 Admin Audit Log (Item #14)
**Problem:** No tracking of admin actions.

**Database Changes:**
- Create `admin_audit_log` table:
  - `id` (uuid)
  - `admin_id` (uuid)
  - `action` (text: 'ban_user', 'unban_user', 'delete_listing', 'change_role', etc.)
  - `target_type` (text: 'user', 'listing', 'complaint')
  - `target_id` (uuid)
  - `details` (jsonb)
  - `created_at` (timestamptz)
- RLS: only admins can read/insert

**Frontend Changes:**
- Add "Activity Log" tab in Admin Dashboard
- Show chronological list of admin actions with filters
- Display admin name, action, target, and timestamp

---

## Phase 4: Engagement & Impact

### 4.1 Donation Impact Dashboard (Item #9)
**Problem:** Users can't see their contribution statistics.

**Solution:**
- Calculate stats from existing data (no new tables needed):
  - Total listings created (donors)
  - Total meals received (receivers)
  - Completed deliveries (volunteers)
  - Estimated food saved (kg) -- use a configurable average per listing
  - CO2 reduction estimate (kg saved x 2.5 = CO2 saved)
- Add impact stats cards to each role's dashboard
- Add impact section to Profile page
- Add platform-wide stats to Admin Dashboard

### 4.2 NGO/Organization Accounts (Items #10, #11)
**Problem:** Only individual users supported.

**Database Changes:**
- Add `ngo` value to `app_role` enum
- Create `organizations` table:
  - `id` (uuid)
  - `user_id` (uuid, references profiles)
  - `org_name` (text)
  - `registration_number` (text)
  - `description` (text)
  - `service_area_km` (integer)
  - `logo_url` (text)
  - `verified` (boolean, default false)
  - `created_at` (timestamptz)
- RLS policies for org data

**Frontend Changes:**
- Create NGO signup page at `/signup/ngo` with organization-specific fields
- Create NGO Dashboard at `/dashboard/ngo` with:
  - Bulk food claim capability
  - Organization impact stats
  - Recurring pickup scheduling (future)
- Admin can verify/approve NGO accounts
- NGOs marked with verified badge on listings

### 4.3 Email Notifications (Item #15)
**Problem:** Only in-app notifications exist.

**Solution:**
- Create a backend function `send-notification-email` that sends emails for critical events
- Trigger on: pickup request accepted, food expiring soon, complaint reply, account banned
- Use a simple email service integration
- Add email notification preferences in user profile settings

---

## Technical Details

### New Files to Create
```text
src/pages/ForgotPassword.tsx
src/pages/ResetPassword.tsx
src/pages/signup/NGOSignup.tsx
src/pages/dashboard/NGODashboard.tsx
src/components/ThemeToggle.tsx
src/components/AvatarUpload.tsx
src/components/ImpactStats.tsx
src/components/ExpiryBadge.tsx
src/components/FoodCategoryFilter.tsx
src/components/BanUserDialog.tsx
supabase/functions/send-notification-email/index.ts
```

### Files to Modify
```text
src/App.tsx                    -- New routes
src/pages/Index.tsx            -- Auth-aware CTAs
src/pages/Login.tsx            -- Forgot password link
src/pages/Profile.tsx          -- Avatar upload, impact stats
src/pages/food/CreateListing.tsx  -- Expiry, categories
src/pages/food/EditListing.tsx    -- Expiry, categories
src/pages/food/BrowseFood.tsx     -- Category filters, expiry display
src/pages/food/FoodDetail.tsx     -- Expiry display, category tags
src/pages/dashboard/*.tsx         -- Impact stats, ban controls
src/components/Navbar.tsx         -- Theme toggle, avatar display
src/lib/food-listings.ts          -- Updated types
src/lib/auth.tsx                  -- Ban check on login
src/main.tsx                      -- ThemeProvider wrapper
```

### Database Migrations Required
1. Add `expires_at` column and `expired` status to food_listings
2. Add `category` and `dietary_tags` columns to food_listings
3. Add `is_banned` and `ban_reason` to profiles
4. Create `admin_audit_log` table with RLS
5. Add `ngo` to app_role enum and create `organizations` table
6. Create `avatars` storage bucket

### Implementation Order
1. Phase 1 (quick wins) -- all 4 items in parallel
2. Phase 2 (food safety) -- expiry first, then categories
3. Phase 3 (admin features) -- ban system first, then audit log
4. Phase 4 (engagement) -- impact dashboard, NGO accounts, email notifications last

This phased approach ensures the most critical and user-facing improvements ship first while building toward the complete platform vision.
