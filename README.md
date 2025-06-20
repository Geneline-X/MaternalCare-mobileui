

# 📱 PreSTrack Mobile App

## 👥 Team Members

* **Iyeba Alpha Kallon**
* **Dennis Stephen Kamara**
* **Nematula Barrie**

---

## 📝 Project Overview

**PreSTrack Mobile** is the patient-facing arm of our maternal health management platform, designed to improve healthcare access for expectant mothers in low-connectivity regions.

### ✨ Key Features

* **📬 Secure Messaging** – Chat with healthcare professionals
* **📊 Health Tracking** – Record pregnancy vitals & appointments
* **📚 Educational Resources** – Access curated maternal health guides
* **📱 SMS Notifications** – Automated reminders via Twilio
* **🔒 Authentication** – Seamless onboarding with Clerk

---

## 🚀 How to Run the Mobile App Locally

### 🔧 Requirements

* Node.js & npm
* Expo CLI
* Git

### 📦 Setup Instructions

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-repo/prestrack-mobile.git
   cd prestrack-mobile
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Copy the example file and fill in your credentials:

   ```bash
   cp .env.example .env
   ```

   Inside `.env`, fill in values such as:

   * `API_URL` – Backend base URL
   * `CLERK_PUBLISHABLE_KEY`
   * `SOCKET_URL`
   * `TWILIO_PHONE_NUMBER` *(if needed)*

4. **Start the Expo dev server**:

   ```bash
   npx expo start
   ```

   Then scan the QR code with your Expo Go app to run it on your device.

---

## 🛠️ Tech Stack

| Tech                | Usage                   |
| ------------------- | ----------------------- |
| React Native + Expo | Frontend framework      |
| TypeScript          | Type-safe development   |
| Context API         | Global state management |
| Clerk               | Authentication system   |
| MongoDB             | Database                |
| Socket.io           | Real-time communication |
| Twilio SMS          | Notifications & alerts  |

---

##  Notes

* This app is designed for **patients** and **facility staff**.
* All patient data follows **FHIR standards** for interoperability.
* Secure **token-based auth** is enabled via Clerk.

---

## 📄 License

MIT License

---


