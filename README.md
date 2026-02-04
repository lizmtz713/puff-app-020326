# PUFF 🌿💨

**Your Personal Cannabis Companion**

Track your strains, log your sessions, and discover your perfect high.

## Features

### 🌿 Strain Library
- **Add & Rate Strains** — Log name, type, THC/CBD, effects, and your rating
- **Photo Support** — Snap pics of your buds
- **Favorites** — Mark strains you love
- **Would Buy Again** — Track what's worth a restock

### 🔥 Session Logging
- **Quick Logs** — Fast session tracking
- **Mood Before/After** — See how cannabis affects you
- **Consumption Methods** — Smoke, vape, edible, dab, and more
- **Effects Tracking** — What did you feel?

### 📊 Insights
- **Usage Patterns** — Sessions per week/month
- **Mood Trends** — Average mood improvement
- **Top Effects** — What you feel most often
- **Method Breakdown** — How you consume

### 👤 Profile
- **Stats Overview** — Your cannabis journey in numbers
- **Secure & Private** — Your data stays yours

## Tech Stack

- React Native (Expo)
- TypeScript
- Firebase (Auth, Firestore, Storage)

## Setup

### 1. Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Firebase project

### 2. Firebase Setup
1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Create **Firestore Database**
4. Enable **Storage** (for strain photos)
5. Get your config from Project Settings

### 3. Configure Environment

Create `app/.env`:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Install & Run

```bash
cd app
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android).

## Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /strains/{strainId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    match /sessions/{sessionId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /strains/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## Project Structure

```
puff-app/
├── app/
│   ├── App.tsx              # Main entry, navigation
│   ├── app.json             # Expo config
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── firebase.ts  # Firebase initialization
│       ├── contexts/
│       │   └── AuthContext.tsx
│       ├── screens/
│       │   ├── auth/
│       │   │   ├── LoginScreen.tsx
│       │   │   └── SignUpScreen.tsx
│       │   ├── HomeScreen.tsx
│       │   ├── AddStrainScreen.tsx
│       │   ├── LogSessionScreen.tsx
│       │   ├── StatsScreen.tsx
│       │   └── ProfileScreen.tsx
│       └── types/
│           └── index.ts
└── README.md
```

## Coming Soon

- 📍 Dispensary tracker
- 🗓 Calendar view of sessions
- 📈 More detailed analytics
- 🔔 Reminder notifications
- 🌐 Share strains with friends
- 💎 Pro features

## Privacy

Your data is stored in your own Firebase project. We don't have access to it.

## License

MIT

---

Built with 🌿 by cannabis enthusiasts, for cannabis enthusiasts.
