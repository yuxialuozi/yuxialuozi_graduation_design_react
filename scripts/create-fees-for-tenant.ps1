# Login as admin
$login = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body (ConvertTo-Json @{username="admin";password="123456"})
$token = $login.data.token
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

Write-Host "=== Creating Fees for Tenant 112 ===" -ForegroundColor Cyan

# Get rooms to use
$rooms = Invoke-RestMethod -Uri "http://localhost:8080/api/rooms?page=1&pageSize=5" -Method GET -Headers $headers
$room = $rooms.data.list[0]
Write-Host "Using room:" $room.roomNo -ForegroundColor White

# Create fees for tenant 112
$periods = @("2026-04", "2026-05", "2026-06")
$createdCount = 0

foreach ($period in $periods) {
    # Rent (required)
    $rentData = @{
        tenantId = 112
        roomNo = $room.roomNo
        feeType = "rent"
        amount = 3500
        period = $period
        dueDate = "$($period)-25"
        status = "unpaid"
    }
    $result = Invoke-RestMethod -Uri "http://localhost:8080/api/fees" -Method POST -Headers $headers -Body ($rentData | ConvertTo-Json)
    if ($result.code -eq 0) { $createdCount++ }

    # Water fee
    $waterData = @{
        tenantId = 112
        roomNo = $room.roomNo
        feeType = "water"
        amount = 120
        period = $period
        dueDate = "$($period)-25"
        status = "unpaid"
    }
    $result = Invoke-RestMethod -Uri "http://localhost:8080/api/fees" -Method POST -Headers $headers -Body ($waterData | ConvertTo-Json)
    if ($result.code -eq 0) { $createdCount++ }

    # Electricity fee
    $elecData = @{
        tenantId = 112
        roomNo = $room.roomNo
        feeType = "electricity"
        amount = 250
        period = $period
        dueDate = "$($period)-25"
        status = "unpaid"
    }
    $result = Invoke-RestMethod -Uri "http://localhost:8080/api/fees" -Method POST -Headers $headers -Body ($elecData | ConvertTo-Json)
    if ($result.code -eq 0) { $createdCount++ }

    # Property fee (paid)
    $propData = @{
        tenantId = 112
        roomNo = $room.roomNo
        feeType = "property"
        amount = 300
        period = $period
        dueDate = "$($period)-25"
        status = "paid"
    }
    $result = Invoke-RestMethod -Uri "http://localhost:8080/api/fees" -Method POST -Headers $headers -Body ($propData | ConvertTo-Json)
    if ($result.code -eq 0) { $createdCount++ }
}

Write-Host "Created $createdCount fee records" -ForegroundColor Green
Write-Host "Each period has: Rent (unpaid), Water (unpaid), Electricity (unpaid), Property (paid)" -ForegroundColor White