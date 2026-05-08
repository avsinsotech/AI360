$apiUrl = "http://localhost:5253/api/HomeLoan"
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer " + $args[0]
}

$payload = @{
    applicationDate = "2026-03-27"
    branch = "PUNE_MAIN"
    memberNo = "MEM-123456"
    applicantName = "TEST APPLICANT"
    borrower = @{
        fullName = "TEST BORROWER"
        age = "30"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $payload
