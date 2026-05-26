# Eventra Occasionz - RSVP + Admin Management System

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable the following services:
   - Authentication (Email/Password)
   - Firestore Database
   - Firebase Storage
   - Firebase Functions (for email notifications)

4. Update `firebase-config.js` with your Firebase credentials:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_ID",
    appId: "YOUR_APP_ID"
};
```

### 2. Firestore Database Structure

#### Collections to create:

**admins**
- `email` (string)
- `role` (string)

**couples**
- `coupleId` (string) - unique identifier
- `coupleName` (string)
- `eventDate` (string)
- `coverImage` (string - URL)
- `story` (string)
- `createdAt` (timestamp)

**guests**
- `guestId` (auto-generated)
- `coupleId` (string)
- `guestName` (string)
- `mobileNumber` (string)
- `password` (string - last 4 digits)
- `uniqueSlug` (string - unique URL identifier)
- `RSVPStatus` (string: 'pending', 'attending', 'not-attending')
- `guestCount` (number)
- `foodPreference` (string)
- `arrivalDate` (string)
- `departureDate` (string)
- `pickupRequired` (boolean)
- `photoURL` (string)
- `qrCode` (string)
- `createdAt` (timestamp)

**events**
- `coupleId` (string)
- `eventName` (string)
- `date` (string)
- `time` (string)
- `venue` (string)
- `mapLink` (string)

### 3. Create Admin User

1. Go to Firebase Console > Authentication > Users
2. Add a new user with email and password
3. Go to Firestore > admins collection
4. Add a document with:
   - Document ID: (use the UID from Authentication)
   - Fields:
     - `email`: (admin email)
     - `role`: "admin"

### 4. Deploy Firebase Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

Set email configuration:
```bash
firebase functions:config:set gmail.email="your-email@gmail.com" gmail.password="your-app-password"
```

### 5. File Structure

```
/
├── admin.html              # Admin login page
├── admin-dashboard.html    # Admin dashboard
├── admin-dashboard.js      # Admin dashboard logic
├── rsvp.html               # Guest RSVP page
├── rsvp.js                 # Guest RSVP logic
├── firebase-config.js      # Firebase configuration
├── styles.css              # All styles
├── functions/
│   ├── index.js            # Firebase Functions
│   └── package.json
└── SETUP.md
```

### 6. Usage

#### Admin Access
- URL: `/admin.html`
- Login with admin credentials
- Manage guests, couples, events, and website content

#### Guest Access
- URL: `/[couple-slug]/[guest-slug]`
- Example: `/sharma-wedding/john-smith-123`
- Password: Last 4 digits of mobile number

### 7. Features

- **Admin Panel:**
  - Dashboard with RSVP statistics
  - Guest management (add/edit/delete/bulk upload)
  - RSVP tracking with filters
  - Photo management
  - Couple and event management
  - Website content control

- **Guest Features:**
  - Secure login with unique link
  - Event timeline and countdown
  - RSVP submission
  - Photo upload (camera/gallery)
  - QR code generation

### 8. Security Rules

Add these Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /admins/{document} {
      allow read, write: if request.auth != null;
    }
    match /couples/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /guests/{document} {
      allow read, write: if true;
    }
    match /events/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 9. Hosting (Optional)

Deploy to Firebase Hosting:
```bash
firebase init hosting
firebase deploy
```

## Support

For questions or support, contact: eventraoccasionz@gmail.com