

# LeftoverLove – Community Food Sharing Platform

A web app to connect food donors, receivers, volunteers, and admins to reduce food waste through local food sharing.

---

## Phase 1: Core Foundation

### Authentication & Role-Based Access
- Sign up, login, forgot/reset password pages with clean modern UI
- Four roles: **Admin**, **Donor**, **Receiver**, **Volunteer** (stored in a secure `user_roles` table)
- Role selection during registration
- Middleware/route guards redirecting users to their respective dashboards

### User Profiles
- Profile table with name, avatar, phone, and bio
- Profile page where users can view and edit their info

---

## Phase 2: Food Listings & Map

### Food Listings (Donor)
- Create/edit/delete food listings with title, description, image upload, pickup address, and status (available/claimed/completed)
- Interactive Leaflet.js map for donors to **pin their pickup location** when creating a listing
- Image uploads stored in Supabase Storage

### Browse & Map View (Receiver)
- Browse all available food listings in a list/grid view
- **Interactive map** showing food markers with popups (title, image, distance, link to detail)
- "Use My Location" button for auto-detection
- Distance-based filtering using location coordinates
- Food detail page with full info and request button

---

## Phase 3: Pickup Requests & Dashboards

### Pickup Request Flow
- Receivers can **request pickup** on a food listing
- Volunteers see pending requests and can **accept** them
- Status tracking: Pending → Accepted → Picked Up → Delivered

### Role-Based Dashboards
- **Donor Dashboard**: My listings, donation stats, request status
- **Receiver Dashboard**: Browse food, my requests, map view
- **Volunteer Dashboard**: Available pickups, my active deliveries, status updates
- **Admin Dashboard**: User management, food listing moderation, overview stats

---

## Phase 4: Communication & Trust

### Messaging
- Simple in-app messaging between donors and receivers
- Message threads linked to food listings
- Unread message indicators on dashboard

### Notifications
- In-app notifications for: new requests, pickup status changes, new messages
- Notification bell with unread count in the header

### Reviews & Ratings
- Receivers can review donors after completed pickups
- Star ratings displayed on user profiles
- Admin can moderate reviews

---

## Phase 5: Admin & Polish

### Admin Moderation
- View/manage all users, assign/remove roles
- Moderate food listings (approve, flag, remove)
- View reports submitted by users
- Review moderation panel

### About Page & Landing
- Public landing/about page explaining the platform mission
- Modern, responsive design throughout

### Badges (Stretch Goal)
- Achievement badges for milestones (e.g., "10 Donations", "First Pickup")
- Display on user profiles

---

## Design & UX
- **Modern, clean UI** with warm, friendly color palette (greens/oranges for food/sustainability theme)
- Fully responsive (mobile-first)
- Consistent card-based layouts for listings and dashboards
- Smooth transitions and loading states

## Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Maps**: Leaflet.js + OpenStreetMap
- **State**: React Query for data fetching

