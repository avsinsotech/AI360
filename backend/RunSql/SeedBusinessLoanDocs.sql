-- Business Loan Document Requirements
-- Categorized into 7 functional sections

INSERT INTO document_master (DocumentName, Category, IsMandatory, LoanType) VALUES
-- 1. KYC DOCUMENTS
('पॅन कार्ड / PAN Card (Applicant + All Partners)', 'KYC Documents', 1, 'BusinessLoan'),
('आधार कार्ड / Aadhaar Card (Applicant + All Partners)', 'KYC Documents', 1, 'BusinessLoan'),
('पासपोर्ट साईज फोटो / Passport Size Photos (2 each)', 'KYC Documents', 1, 'BusinessLoan'),
('Address Proof (Electric Bill/Telephone Bill/Passport)', 'KYC Documents', 1, 'BusinessLoan'),
('मतदार ओळखपत्र / Voter ID Card (If available)', 'KYC Documents', 0, 'BusinessLoan'),
('ड्रायव्हिंग लायसन्स / Driving License (If available)', 'KYC Documents', 0, 'BusinessLoan'),

-- 2. BUSINESS REGISTRATION DOCUMENTS
('दुकान नोंदणी प्रमाणपत्र / Shop Registration Certificate', 'Business Registration', 0, 'BusinessLoan'),
('GST नोंदणी प्रमाणपत्र / GST Registration Certificate', 'Business Registration', 0, 'BusinessLoan'),
('उद्योग आधार / Udyog Aadhaar/MSME Certificate', 'Business Registration', 0, 'BusinessLoan'),
('भागीदारी करारनामा / Partnership Deed (For Partnership)', 'Business Registration', 0, 'BusinessLoan'),
('Memorandum of Association (MOA) (For Companies)', 'Business Registration', 0, 'BusinessLoan'),
('Articles of Association (AOA) (For Companies)', 'Business Registration', 0, 'BusinessLoan'),
('Certificate of Incorporation (For Companies)', 'Business Registration', 0, 'BusinessLoan'),
('Certificate of Commencement', 'Business Registration', 0, 'BusinessLoan'),
('परवाना / Trade License', 'Business Registration', 0, 'BusinessLoan'),

-- 3. FINANCIAL DOCUMENTS
('Balance Sheet (Last 3 Years)', 'Financial Documents', 0, 'BusinessLoan'),
('P&L Statement (Last 3 Years)', 'Financial Documents', 0, 'BusinessLoan'),
('Bank Statement (Last 6 Months)', 'Financial Documents', 1, 'BusinessLoan'),
('ITR (Last 3 Years)', 'Financial Documents', 0, 'BusinessLoan'),
('ITR Acknowledgement / Form 26AS', 'Financial Documents', 0, 'BusinessLoan'),
('GST Returns (Last 12 Months)', 'Financial Documents', 0, 'BusinessLoan'),
('Audited Financial Statements', 'Financial Documents', 0, 'BusinessLoan'),
('Sales Invoice/Purchase Bills नमुने / Sample Bills', 'Financial Documents', 0, 'BusinessLoan'),
('Stock Statement / Inventory Details', 'Financial Documents', 0, 'BusinessLoan'),

-- 4. PROJECT/BUSINESS PLAN
('प्रकल्प अहवाल / Project Report (For New Business)', 'Project/Business Plan', 0, 'BusinessLoan'),
('व्यवसाय योजना / Business Plan', 'Project/Business Plan', 0, 'BusinessLoan'),
('खर्चाचा अंदाज / Cost Estimation', 'Project/Business Plan', 0, 'BusinessLoan'),
('Quotations/Proforma Invoice (For Machinery)', 'Project/Business Plan', 0, 'BusinessLoan'),
('Means of Finance / Own Contribution Proof', 'Project/Business Plan', 0, 'BusinessLoan'),
('विद्यमान कर्जाचे तपशील / Existing Loan Details', 'Project/Business Plan', 0, 'BusinessLoan'),

-- 5. PROPERTY/COLLATERAL DOCUMENTS
('७/१२ उतारा / 7/12 Extract (For Land)', 'Property/Collateral', 0, 'BusinessLoan'),
('८अ उतारा / Property Card (8-A)', 'Property/Collateral', 0, 'BusinessLoan'),
('Index II (शोध अहवाल) / Search Report', 'Property/Collateral', 0, 'BusinessLoan'),
('विक्री खत / Sale Deed', 'Property/Collateral', 0, 'BusinessLoan'),
('ताबा पत्र / Possession Letter', 'Property/Collateral', 0, 'BusinessLoan'),
('मालमत्ता कर रसीद / Property Tax Receipt', 'Property/Collateral', 0, 'BusinessLoan'),
('नकाशा मंजूर / Approved Plan/Layout', 'Property/Collateral', 0, 'BusinessLoan'),
('ना-हरकत प्रमाणपत्र / NA/Non-Agriculture Conversion', 'Property/Collateral', 0, 'BusinessLoan'),
('मालमत्ता मूल्यांकन अहवाल / Property Valuation Report', 'Property/Collateral', 0, 'BusinessLoan'),
('Share Certificate / Allotment Letter (For Flat)', 'Property/Collateral', 0, 'BusinessLoan'),
('Society NOC (Flat साठी / For Flat)', 'Property/Collateral', 0, 'BusinessLoan'),

-- 6. ADDITIONAL DOCUMENTS
('CIBIL Score/Report', 'Additional Documents', 0, 'BusinessLoan'),
('जामीनदार KYC / Guarantor KYC', 'Additional Documents', 1, 'BusinessLoan'),
('जामीनदार Bank Statement / Guarantor Bank Statement', 'Additional Documents', 0, 'BusinessLoan'),
('जामीनदार ITR / Guarantor ITR', 'Additional Documents', 0, 'BusinessLoan'),
('Current Account Cheques (6 Cheques)', 'Additional Documents', 0, 'BusinessLoan'),
('Post-Dated Cheques (PDC)', 'Additional Documents', 0, 'BusinessLoan'),
('NACH/ECS/Standing Instruction Mandate', 'Additional Documents', 0, 'BusinessLoan'),
('विमा पॉलिसी / Insurance Policy (مالमत्ता/स्टॉक / Property/Stock)', 'Additional Documents', 0, 'BusinessLoan'),
('कार्यालय/दुकान भाडे करारनामा / Office/Shop Rent Agreement', 'Additional Documents', 0, 'BusinessLoan'),
('Electricity Bill (व्यवसाय ठिकाणाचे) / Business Premises', 'Additional Documents', 0, 'BusinessLoan'),
('Business Photos (दुकान/कार्यालय/कारखाना) / Photos', 'Additional Documents', 0, 'BusinessLoan'),

-- 7. FOR MANUFACTURING/SERVICE BUSINESS
('FSSAI License (खाद्यपदार्थ) / Food License', 'Manufacturing/Service', 0, 'BusinessLoan'),
('Pollution Control Board NOC', 'Manufacturing/Service', 0, 'BusinessLoan'),
('Fire NOC / Fire Safety Certificate', 'Manufacturing/Service', 0, 'BusinessLoan'),
('Factory License', 'Manufacturing/Service', 0, 'BusinessLoan'),
('Import-Export Code (IEC)', 'Manufacturing/Service', 0, 'BusinessLoan'),
('Professional Tax Registration', 'Manufacturing/Service', 0, 'BusinessLoan'),
('ESI/PF Registration', 'Manufacturing/Service', 0, 'BusinessLoan'),
('कामगार यादी / Employee List', 'Manufacturing/Service', 0, 'BusinessLoan');
