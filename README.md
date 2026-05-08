# Loan Scrutiny System

An enterprise-grade loan management and scrutiny system built with a robust **.NET 8** backend and a high-density, performant **React/Vite** frontend.

## 🚀 Features

- **Gold Loan Module**: Automated deductions, sanction letter generation, and technical appraisal notes.
- **Aadhaar Verification**: Integrated e-KYC with live geolocation tracking and address validation.
- **Dynamic Grid UI**: Responsive, professional layout standardized across all loan types (Home, Vehicle, Business, etc.).
- **Automated Calculations**: Sophisticated deduction engine for service charges, valuer fees, and more.

## 🛠 Tech Stack

- **Backend**: C# / .NET 8 (ASP.NET Core Web API)
- **Frontend**: React.js / Vite / TailwindCSS (Grid-based layout)
- **Database**: MySQL / MariaDB
- **Authentication**: JWT (JSON Web Token)

## 📦 Setup Instructions

### Prerequisites
- .NET 8 SDK
- Node.js (v18+)
- MySQL Server

### Backend Setup
1. Navigate to the `backend/` directory.
2. Duplicate `appsettings.Example.json` and rename it to `appsettings.json`.
3. Update the connection string with your local database credentials.
4. Run migrations: `dotnet ef database update`.
5. Start the server: `dotnet run`.

### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.

## 📜 License
Internal Enterprise Proprietary
