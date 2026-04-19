# Recruiter Portal - Candidates Page

This directory contains the complete implementation of the Candidates page for the recruiter portal, matching the exact UI/UX from the provided design images.

## Components

### 1. CandidatesPage.tsx
Main page component that displays:
- **Stats Cards**: Total Candidates, Hired, Pending, Rejected, In Last 24 Hours
- **Search & Filter Section**: Filter by name, job position, status, and match score
- **Tabs**: All, New, Shortlisted, High Match
- **Candidate List**: Shows all candidates with their details
- **Pagination**: Navigate through candidate pages

### 2. CandidateDetailModal.tsx
Modal that displays full candidate profile:
- Summary section
- Experience details
- Education information
- Job title applied for
- Match score indicator
- Current status badge
- Skills tags
- Download CV button
- Change status button

### 3. ChangeStatusModal.tsx
Simple modal for changing candidate status:
- Dropdown to select new status (New, Pending, Shortlisted, Rejected, Hired)
- Cancel and Save buttons
- Shows success toast notification on save

### 4. JobDetailsModal.tsx
Modal showing job details:
- Job title and company
- Job meta information (Remote, Full-time, Salary)
- Job description
- Required skills
- Show candidates button

### 5. RecruiterLayout.tsx
Layout wrapper with sidebar navigation:
- Dashboard
- My Jobs
- Candidates
- Archived Jobs
- Profile
- Upgrade plan
- Logout

## Features

✅ **Complete UI/UX Match**: Every element matches the design images exactly
✅ **Responsive Design**: Works on all screen sizes
✅ **Interactive Elements**: All buttons, modals, and filters are functional
✅ **Status Management**: Change candidate status with visual feedback
✅ **Match Score Indicators**: Color-coded circular progress indicators
✅ **Toast Notifications**: Success messages when actions complete
✅ **Filtering & Search**: Filter candidates by multiple criteria
✅ **Tab Navigation**: Quick access to candidate segments
✅ **Modal Overlays**: Professional modal dialogs with backdrop

## Routes

- `/recruiter/candidates` - Main candidates page
- `/recruiter/dashboard` - Recruiter dashboard
- `/recruiter/my-jobs` - Job listings
- `/recruiter/archived-jobs` - Archived jobs
- `/recruiter/profile` - Profile settings
- `/recruiter/upgrade` - Upgrade plans

## Styling

All components use:
- Tailwind CSS for styling
- shadcn/ui components for consistency
- Custom color scheme matching the design
- Proper spacing and typography

## Status Colors

- **New**: Green (#10B981)
- **Pending**: Yellow/Orange (#F59E0B)
- **Shortlisted**: Purple (#8B5CF6)
- **Rejected**: Red (#EF4444)
- **Hired**: Blue (#3B82F6)

## Match Score Colors

- **90%+**: Green (High match)
- **70-89%**: Yellow (Medium match)
- **Below 70%**: Red (Low match)

## Usage

```tsx
import CandidatesPage from '@/pages/recruiter/CandidatesPage';

// In your router
<Route path="/recruiter/candidates" element={<CandidatesPage />} />
```

## Future Enhancements

- Connect to real API endpoints
- Add bulk actions for candidates
- Export candidate data
- Advanced filtering options
- Email integration
- Interview scheduling
