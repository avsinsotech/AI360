# Bugfix Requirements Document

## Introduction

The Personal Loan API endpoint crashes when attempting to retrieve loan data due to a database schema mismatch. The BorrowerInfo model in the C# codebase defines two fields (`OfficeAddress` and `GavchaAddress`) that do not exist as columns in the MySQL database table. When Entity Framework Core generates SQL queries to retrieve BorrowerInfo data, it attempts to select these non-existent columns, resulting in a MySqlException: "Unknown column 'p0.GavchaAddress' in 'field list'". This prevents the application from retrieving any personal loan data, breaking critical functionality.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the API endpoint GET /api/PersonalLoan/{id} is called THEN the system crashes with MySqlException "Unknown column 'p0.GavchaAddress' in 'field list'"

1.2 WHEN the API endpoint GET /api/PersonalLoan (list all) is called THEN the system crashes with MySqlException "Unknown column 'p0.GavchaAddress' in 'field list'"

1.3 WHEN Entity Framework Core queries the BorrowerInfo table with Include() THEN the system generates SQL that references non-existent columns OfficeAddress and GavchaAddress

1.4 WHEN any PersonalLoan query includes the Borrower navigation property THEN the system fails to retrieve data and returns a 500 Internal Server Error

### Expected Behavior (Correct)

2.1 WHEN the API endpoint GET /api/PersonalLoan/{id} is called THEN the system SHALL successfully retrieve and return the personal loan data without crashing

2.2 WHEN the API endpoint GET /api/PersonalLoan (list all) is called THEN the system SHALL successfully retrieve and return all personal loan records without crashing

2.3 WHEN Entity Framework Core queries the BorrowerInfo table with Include() THEN the system SHALL generate SQL that only references columns that exist in the database schema

2.4 WHEN any PersonalLoan query includes the Borrower navigation property THEN the system SHALL successfully retrieve the data and return a 200 OK response with the loan information

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the API retrieves PersonalLoan data with existing BorrowerInfo fields (e.g., FullName, Age, Mobile, Email) THEN the system SHALL CONTINUE TO return these fields correctly

3.2 WHEN the API retrieves PersonalLoan data with Guarantor1Info and Guarantor2Info navigation properties THEN the system SHALL CONTINUE TO include these related entities correctly

3.3 WHEN the API retrieves PersonalLoan data with OfficeInfo navigation property THEN the system SHALL CONTINUE TO include this related entity correctly

3.4 WHEN the API applies authorization checks based on user role and client code THEN the system SHALL CONTINUE TO enforce these security rules correctly

3.5 WHEN the API flattens loan data using the FlattenLoan method THEN the system SHALL CONTINUE TO transform the data structure as expected

3.6 WHEN the database contains existing BorrowerInfo records with all other fields populated THEN the system SHALL CONTINUE TO retrieve and display these fields without data loss
