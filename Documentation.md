# TushGPT Project Documentation

This document provides a detailed technical and functional overview of two core modules in the TushGPT project: the **Verification Module** and the **AI Loan Scrutiny (Avs Saarthi AI) Module**.

---

## 1. Verification Module

### Overview
The Verification Module is a robust, multi-tenant system designed to verify various identity, financial, and business documents. It acts as a secure gateway between the frontend and a centralized internal verification service.

### Supported Verifications
- **Aadhaar Verification**: OTP-based verification with integrated credit deduction.
- **PAN Verification**: Real-time PAN validity check with automated record saving.
- **CIBIL Score**: Deep integration to fetch, parse, and store detailed credit reports.
- **GST & Udyam**: Business entity verification for loan appraisal.
- **Voter & Passport**: Additional KYC verification methods.

### Technical Architecture

#### Backend (ASP.NET Core)
The backend controllers function as **secure proxies** to an internal API (`http://192.168.20.151:90`).

- **Key Controllers**:
    - `AadharProxyController.cs`: Manages OTP flow (`send-otp`, `verify-otp`) and history.
    - `PanProxyController.cs`: Validates PAN numbers and extracts names for cross-verification.
    - `CibilProxyController.cs`: Parses complex JSON responses into structured metrics (Score, Overdue counts, etc.).
- **Multi-Tenancy**: Every request is isolated by a `ClientCode` extracted from the JWT token.
- **Credit System**: Uses `CreditService.cs` to deduct credits for each successful verification.
- **Data Persistence**: Successful verifications are cached in the database (`VerifiedPans`, `VerifiedAadhars`, `CibilReports`) to prevent redundant external API calls and save costs.

#### Frontend (React)
- **VerificationHub**: A centralized dashboard where users can select and trigger various verification tasks.
- **Real-time Feedback**: Components provide instant status updates and display verified data directly in forms.

---

## 2. AI Loan Scrutiny Module (Avs Saarthi AI)

### Overview
**Avs Saarthi AI** is an intelligent assistant designed for senior loan officers. It automates the technical scrutiny of loan applications using Large Language Models (LLM) to calculate risk scores and provide recommendations.

### Scrutiny Workflow

#### 1. Data Collection (3-Step Wizard)
- **Step 1: Member Information**: Collects Member ID, Aadhaar, PAN, and Membership Tenure.
- **Step 2: Financial Background**: captures CIBIL Score, Share Capital, Deposits, and Net Monthly Income.
- **Step 3: Loan Details**: Inputs the proposed Loan Amount, Tenure, and Interest Rate (EMI is auto-calculated).

#### 2. AI Analysis Logic
When "Calculate Report" is triggered, the system:
1. Compiles a detailed prompt containing all financial data.
2. Sends it to the **Llama-3.3-70b-versatile** model via a secure backend endpoint.
3. The AI acts as a "Senior Loan Officer" and applies a predefined scoring rubric.

#### 3. Risk Assessment & Grading
The AI breaks down the analysis into 8 key metrics (Scored out of 100):
- **Membership Stability** (0-10)
- **Share Capital Capacity** (0-10)
- **Deposit Capacity** (0-10)
- **FOIR (Fixed Obligation to Income Ratio)** (0-15)
- **Overdue History** (0-15)
- **Employment Stability** (0-8)
- **Guarantor FOIR** (0-10)
- **Income Stability** (0-7)

**Grading System:**
- **Grade A**: Low Risk (High probability of approval).
- **Grade B**: Medium Risk (Requires committee review).
- **Grade C**: High Risk (Likely rejection).

### Reporting & Output
- **Bilingual Support**: Reports are available in both **Marathi** and **English**.
- **Pointwise Analysis**: AI provides 5-6 detailed points explaining the rationale behind the decision.
- **PDF Generation**: Integration with `html2pdf.js` allows for professional, printable A4 risk assessment reports.
- **Persistence**: Final reports are saved in the `Reports` table, allowing for easy retrieval from the user dashboard.

---

## Data Models Summary
| Model | Key Fields | Purpose |
| :--- | :--- | :--- |
| `Report` | `AppId`, `ClientCode`, `DataJson` | Stores Scrutiny Results |
| `VerifiedPan` | `PanNo`, `Name`, `ClientCode` | Stores PAN History |
| `CibilReport` | `CibilScore`, `TotalOutstanding` | Stores Credit History |
