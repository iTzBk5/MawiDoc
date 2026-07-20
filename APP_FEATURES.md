# MawiDOC - Project Overview & Features

## 🏥 What is this code about?
**MawiDOC** is a modern, full-stack medical appointment booking platform. It connects **Patients** who are looking for medical care with **Doctors** who provide consultations. 

The project is built as a **Monorepo** (multiple projects in one repository) and uses a state-of-the-art modern technology stack:

1. **Backend (`/server`)**: A Node.js API built with Express, using **Prisma ORM** to talk to a **PostgreSQL** database. It handles all the heavy lifting, security, and data storage.
2. **Mobile App (`/mobile`)**: A cross-platform mobile application built with **React Native** (v0.86). It is used by both Doctors and Patients depending on how they log in. It uses `Zustand` for state management and `React Navigation` for screen routing.
3. **Shared Code (`/shared`)**: A library containing TypeScript types and `Zod` validation schemas that are shared between the frontend and backend to ensure data is always correct.

---

## ✨ Features Currently Built in the App

Based on a full scan of your codebase, here are the features you currently have implemented:

### 🔐 1. Authentication & Security
* **Role-Based Access**: The app supports two types of users: `PATIENT` and `DOCTOR`. The screens change completely depending on who logs in.
* **JWT Security**: Secure login and session management using JSON Web Tokens.
* **Password Encryption**: Passwords are securely hashed in the database using `bcrypt`.

### 🧑‍🦱 2. Patient Features
* **Patient Profile**: Patients can manage their personal details (Name, Age, Gender, City).
* **Search & Discovery**: Patients can search for doctors based on Medical Specialty (e.g., Cardiology, Dermatology), City, or the Doctor's name.
* **Doctor Profiles**: Patients can view a doctor's clinic details, address, description, consultation price, and exact geographical location.
* **Appointment Booking**: Patients can view a doctor's `Available Slots` on specific days and request to book an appointment for that time slot.
* **Appointment Tracking**: Patients can view their upcoming, pending, accepted, or completed appointments.

### 👨‍⚕️ 3. Doctor Features
* **Doctor Profile Management**: Doctors can set up their public profile, update their clinic address, set their consultation price, and toggle whether their clinic is currently "Open".
* **Schedule Management**: Doctors can define their `Working Days` (e.g., Monday to Friday) and their standard working hours (e.g., 09:00 to 17:00).
* **Slot Management**: The system generates available time slots for the doctor, which they can manage.
* **Appointment Dashboard**: Doctors receive appointment requests from patients. They have the power to `ACCEPT`, `REJECT`, `CANCEL`, or mark an appointment as `COMPLETED`.

### 🔔 4. Notifications & System Features
* **Push Notifications**: The app is integrated with Firebase Cloud Messaging (FCM) to send real-time push notifications to users (e.g., when a doctor accepts an appointment).
* **Multi-language Support (i18n)**: The mobile app is fully configured to support multiple languages (English, French, Arabic), dynamically changing text direction and translations.
* **Background Tasks**: The Node.js server uses `node-cron` to run background jobs (likely for sending appointment reminders).
