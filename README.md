##  Frontend
1. Open terminal/cmd in the project
2. Run the command "npm install"
3. Run "ipconfig"
4. Copy IPv4 Address
5. Go to config/api.js and paste the copied IP address inside "LOCAL_IP" variable
6. Download the Expo Go app from the Play Store.
7. Go to the terminal and run "npx expo start" then a QR code will show
8. Scan the QR using the Expo Go app. The app will start

NeoBlood App - Manual:

This guide explains which file creates which screen in the app. Each file makes one screen that users see.

---

## 📱 Main Screens

### Welcome Screen
**File:** `app/index.jsx`
- First screen when you open the app
- Shows "Welcome to NeoBlood"
- Has a "Get Started" button

---

## 🔐 Login & Sign Up Screens

### Login Screen
**File:** `app/(auth)/login.jsx`
- Where users sign in with email and password
- Takes you to the main app after login

### Sign Up Screen
**File:** `app/(auth)/signup.jsx`
- Where new users create an account
- Asks for name, email, phone, blood group, etc.
- Takes you to the main app after signing up

---

## 🏠 Main App Screens (Bottom Tabs)

These screens are always accessible from the bottom navigation bar:

### Home Screen
**File:** `app/(dashboard)/home.jsx`
- Main screen after login
- Shows your eligibility status
- Has buttons to access all features:
  - Donate Blood
  - Post for blood
  - Find Donors
  - Requests
  - My circle
  - My Posts

### Profile Screen
**File:** `app/(dashboard)/profile.jsx`
- Shows your personal information
- Displays your blood group, age, donations, and points
- Shows your donation history

### Leaderboard Screen
**File:** `app/(dashboard)/leaderboard.jsx`
- Shows top donors ranked by points
- Displays who has donated the most

### Find Donors Map Screen
**File:** `app/(dashboard)/find.jsx`
- Shows a map with nearby blood donors
- You can filter by blood group
- Click on markers to see donor details

### Settings Screen
**File:** `app/(dashboard)/settings.jsx`
- Change your password
- Delete your account
- Logout

---

## 📋 Feature Screens

These screens open when you tap buttons on the Home screen:

### Donate Blood Screen
**File:** `app/screens/donate.jsx`
- Shows list of people who need blood
- You can search by location
- You can accept requests to donate

### Post Blood Request Screen
**File:** `app/screens/post.jsx`
- Create a new request for blood
- Fill in blood group, date, time, and location
- Submit your request

### Find Eligible Donors Screen
**File:** `app/screens/donor.jsx`
- Find donors who match your blood request
- See donor details and contact them
- Send connection requests

### My Circle Screen
**File:** `app/screens/circle.jsx`
- Search for users by phone number
- Save trusted donors to your circle
- View and manage your saved contacts

### Requests Screen
**File:** `app/screens/requests.jsx`
- See blood donation requests sent to you
- Accept or reject requests
- View request details

### My Posts Screen
**File:** `app/screens/myposts.jsx`
- See all your active blood requests
- View details of each request
- Delete requests you no longer need

---

## 📂 Folder Structure

```
app/
├── index.jsx                    → Welcome screen
│
├── (auth)/                      → Login & Sign Up folder
│   ├── login.jsx               → Login screen
│   └── signup.jsx              → Sign up screen
│
├── (dashboard)/                 → Main app folder
│   ├── home.jsx                → Home screen
│   ├── profile.jsx             → Profile screen
│   ├── leaderboard.jsx         → Leaderboard screen
│   ├── find.jsx                → Map screen
│   └── settings.jsx             → Settings screen
│
└── screens/                     → Feature screens folder
    ├── donate.jsx              → Donate screen
    ├── post.jsx                → Post request screen
    ├── donor.jsx               → Find donors screen
    ├── circle.jsx              → My circle screen
    ├── requests.jsx            → Requests screen
    └── myposts.jsx            → My posts screen
```

---

## 🔄 How Screens Connect

1. **App opens** → Welcome screen (`index.jsx`)
2. **Tap "Get Started"** → Sign up screen
3. **After signup/login** → Home screen
4. **From Home screen** → Tap any button to open feature screens
5. **Bottom tabs** → Switch between Home, Profile, Leaderboard, Find, Settings

---

## 🎨 App Colors

- **White** - Background color
- **Red** - Buttons and important elements
- **Green** - Success messages and eligible status
- **Black** - Text color

---

## 📋 Quick Lookup Table

| What You See | Which File to Edit |
|-------------|-------------------|
| Welcome screen | `app/index.jsx` |
| Login page | `app/(auth)/login.jsx` |
| Sign up page | `app/(auth)/signup.jsx` |
| Home page | `app/(dashboard)/home.jsx` |
| Your profile | `app/(dashboard)/profile.jsx` |
| Leaderboard | `app/(dashboard)/leaderboard.jsx` |
| Map of donors | `app/(dashboard)/find.jsx` |
| Settings | `app/(dashboard)/settings.jsx` |
| Donate blood page | `app/screens/donate.jsx` |
| Post request page | `app/screens/post.jsx` |
| Find donors page | `app/screens/donor.jsx` |
| My circle page | `app/screens/circle.jsx` |
| Requests page | `app/screens/requests.jsx` |
| My posts page | `app/screens/myposts.jsx` |

---

**Tip:** If you want to change what appears on a screen, find the file name in the table above and edit that file.
