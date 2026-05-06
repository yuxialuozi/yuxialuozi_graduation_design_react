# 租户信息管理系统 - 测试数据生成脚本
# 用于生成正规的测试数据并测试系统流程

# ============ 配置 ============
$BASE_URL = "http://localhost:8080/api"
$headers = @{
    "Content-Type" = "application/json"
}

# ============ 登录获取Token ============
Write-Host "========== 1. 登录获取Token ==========" -ForegroundColor Cyan
$loginResult = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"123456"}'
$token = $loginResult.data.token
$headers["Authorization"] = "Bearer $token"
Write-Host "✓ 登录成功，用户: $($loginResult.data.user.nickname)" -ForegroundColor Green

# ============ 2. 清理旧数据（可选，谨慎使用）============
# 为了测试，我们保留现有数据，只添加新的测试数据

# ============ 3. 创建测试租户 ============
Write-Host "`n========== 2. 创建测试租户 ==========" -ForegroundColor Cyan

$tenants = @(
    @{
        name = "北京科技有限公司"
        contactPerson = "张三"
        phone = "13800138001"
        email = "zhangsan@bjtech.com"
        status = "active"
    },
    @{
        name = "上海贸易集团"
        contactPerson = "李四"
        phone = "13800138002"
        email = "lisi@shanghaitrading.com"
        status = "active"
    },
    @{
        name = "广州制造业有限公司"
        contactPerson = "王五"
        phone = "13800138003"
        email = "wangwu@gzmfg.com"
        status = "active"
    },
    @{
        name = "深圳互联网科技"
        contactPerson = "赵六"
        phone = "13800138004"
        email = "zhaoliu@sztech.com"
        status = "active"
    },
    @{
        name = "成都软件开发中心"
        contactPerson = "孙七"
        phone = "13800138005"
        email = "sunqi@cddev.com"
        status = "active"
    }
)

$createdTenants = @()
foreach ($tenant in $tenants) {
    try {
        $result = Invoke-RestMethod -Uri "$BASE_URL/tenants" -Method POST -Headers $headers -Body ($tenant | ConvertTo-Json)
        if ($result.code -eq 0) {
            $createdTenants += $result.data
            Write-Host "  ✓ 创建租户: $($tenant.name)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ 创建租户失败: $($tenant.name) - $($result.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ⚠ 租户已存在或创建失败: $($tenant.name)" -ForegroundColor Yellow
        # 尝试获取现有租户
        try {
            $list = Invoke-RestMethod -Uri "$BASE_URL/tenants?page=1&pageSize=100" -Method GET -Headers $headers
            $existing = $list.data.list | Where-Object { $_.name -eq $tenant.name }
            if ($existing) {
                $createdTenants += $existing
                Write-Host "    使用现有租户: $($tenant.name)" -ForegroundColor Yellow
            }
        } catch {}
    }
    Start-Sleep -Milliseconds 100
}

if ($createdTenants.Count -eq 0) {
    # 获取现有租户
    $list = Invoke-RestMethod -Uri "$BASE_URL/tenants?page=1&pageSize=100" -Method GET -Headers $headers
    $createdTenants = $list.data.list
    Write-Host "  使用现有租户列表，共 $($createdTenants.Count) 个" -ForegroundColor Yellow
}

Write-Host "  租户总数: $($createdTenants.Count)" -ForegroundColor Cyan

# ============ 4. 创建测试房间 ============
Write-Host "`n========== 3. 创建测试房间 ==========" -ForegroundColor Cyan

$buildings = @("A栋", "B栋", "C栋")
$rooms = @()

foreach ($building in $buildings) {
    for ($floor = 1; $floor -le 3; $floor++) {
        for ($room = 1; $room -le 3; $room++) {
            $roomNo = "$($building.Replace('栋',''))-$($floor)0$room"
            $roomData = @{
                roomNo = $roomNo
                building = $building
                floor = $floor
                area = 80 + (Get-Random -Minimum 0 -Maximum 40)
                status = "available"
                rent = 3000 + (Get-Random -Minimum 0 -Maximum 2000)
                description = "$($building)第$($floor)层第$($room)室"
            }
            $rooms += $roomData

            try {
                $result = Invoke-RestMethod -Uri "$BASE_URL/rooms" -Method POST -Headers $headers -Body ($roomData | ConvertTo-Json)
                if ($result.code -eq 0) {
                    Write-Host "  ✓ 创建房间: $roomNo" -ForegroundColor Green
                }
            } catch {
                Write-Host "  ⚠ 房间已存在: $roomNo" -ForegroundColor Yellow
            }
            Start-Sleep -Milliseconds 50
        }
    }
}

# 获取所有房间
$roomList = Invoke-RestMethod -Uri "$BASE_URL/rooms?page=1&pageSize=100" -Method GET -Headers $headers
Write-Host "  房间总数: $($roomList.data.total)" -ForegroundColor Cyan

# ============ 5. 创建测试合同 ============
Write-Host "`n========== 4. 创建测试合同 ==========" -ForegroundColor Cyan

$availableRooms = $roomList.data.list | Where-Object { $_.status -eq "available" }
$contractStatuses = @("draft", "active", "active", "active") # 更多活跃合同

for ($i = 0; $i -lt [Math]::Min(5, $createdTenants.Count); $i++) {
    $tenant = $createdTenants[$i]
    $room = $availableRooms[$i % $availableRooms.Count]

    $startDate = (Get-Date).AddDays(-30)
    $endDate = (Get-Date).AddDays(365)

    $contractData = @{
        tenantId = $tenant.id
        contractNo = "HT$(Get-Date -Format 'yyyyMMdd')$(Get-Random -Minimum 1000 -Maximum 9999)"
        startDate = $startDate.ToString("yyyy-MM-dd")
        endDate = $endDate.ToString("yyyy-MM-dd")
        amount = $room.rent * 12
        status = $contractStatuses[$i % $contractStatuses.Count]
    }

    try {
        $result = Invoke-RestMethod -Uri "$BASE_URL/contracts" -Method POST -Headers $headers -Body ($contractData | ConvertTo-Json)
        if ($result.code -eq 0) {
            Write-Host "  ✓ 创建合同: $($contractData.contractNo) - $($tenant.name)" -ForegroundColor Green

            # 如果状态是草稿，激活它
            if ($contractData.status -eq "draft") {
                Start-Sleep -Milliseconds 200
                try {
                    $activateResult = Invoke-RestMethod -Uri "$BASE_URL/contracts/$($result.data.id)/activate" -Method POST -Headers $headers -Body "{}"
                    if ($activateResult.code -eq 0) {
                        Write-Host "    ✓ 合同已激活" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "    ⚠ 合同激活失败（可能后端路由未更新）" -ForegroundColor Yellow
                }
            }
        }
    } catch {
        Write-Host "  ✗ 创建合同失败: $($tenant.name)" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 100
}

# 获取合同列表
$contractList = Invoke-RestMethod -Uri "$BASE_URL/contracts?page=1&pageSize=100" -Method GET -Headers $headers
Write-Host "  合同总数: $($contractList.data.total)" -ForegroundColor Cyan

# ============ 6. 创建测试费用 ============
Write-Host "`n========== 5. 创建测试费用 ==========" -ForegroundColor Cyan

$feeTypes = @("rent", "water", "electricity", "property")
$feeTypeNames = @{
    "rent" = "租金"
    "water" = "水费"
    "electricity" = "电费"
    "property" = "物业费"
}
$periods = @("2026-04", "2026-05", "2026-06")

# 为最近创建的租户创建费用
$feesToCreate = @()
foreach ($tenant in $createdTenants | Select-Object -First 10) {
    foreach ($period in $periods) {
        $roomNo = "A-10$((Get-Random -Minimum 1 -Maximum 4))" # 模拟房间号

        # 租金（必须有）
        $rentData = @{
            tenantId = $tenant.id
            roomNo = $roomNo
            feeType = "rent"
            amount = 3500 + (Get-Random -Minimum 0 -Maximum 1500)
            period = $period
            dueDate = "$($period)-25"
            status = if ((Get-Random -Minimum 0 -Maximum 10) -gt 3) { "unpaid" } else { "paid" }
        }
        $feesToCreate += $rentData

        # 水电费（随机）
        if ((Get-Random -Minimum 0 -Maximum 10) -gt 3) {
            $feesToCreate += @{
                tenantId = $tenant.id
                roomNo = $roomNo
                feeType = "water"
                amount = 50 + (Get-Random -Minimum 0 -Maximum 200)
                period = $period
                dueDate = "$($period)-25"
                status = if ((Get-Random -Minimum 0 -Maximum 10) -gt 5) { "unpaid" } else { "paid" }
            }
        }

        if ((Get-Random -Minimum 0 -Maximum 10) -gt 3) {
            $feesToCreate += @{
                tenantId = $tenant.id
                roomNo = $roomNo
                feeType = "electricity"
                amount = 100 + (Get-Random -Minimum 0 -Maximum 300)
                period = $period
                dueDate = "$($period)-25"
                status = if ((Get-Random -Minimum 0 -Maximum 10) -gt 5) { "unpaid" } else { "paid" }
            }
        }

        # 物业费（随机）
        if ((Get-Random -Minimum 0 -Maximum 10) -gt 5) {
            $feesToCreate += @{
                tenantId = $tenant.id
                roomNo = $roomNo
                feeType = "property"
                amount = 200 + (Get-Random -Minimum 0 -Maximum 150)
                period = $period
                dueDate = "$($period)-25"
                status = if ((Get-Random -Minimum 0 -Maximum 10) -gt 5) { "unpaid" } else { "paid" }
            }
        }
    }
}

$createdFees = 0
foreach ($fee in $feesToCreate) {
    try {
        $result = Invoke-RestMethod -Uri "$BASE_URL/fees" -Method POST -Headers $headers -Body ($fee | ConvertTo-Json)
        if ($result.code -eq 0) {
            $createdFees++
            if ($createdFees % 10 -eq 0) {
                Write-Host "  已创建 $createdFees 条费用记录..." -ForegroundColor Cyan
            }
        }
    } catch {
        # 忽略重复或错误
    }
    Start-Sleep -Milliseconds 20
}

Write-Host "  ✓ 创建费用完成，新增 $createdFees 条" -ForegroundColor Green

# 获取费用统计
$feeList = Invoke-RestMethod -Uri "$BASE_URL/fees?page=1&pageSize=1" -Method GET -Headers $headers
Write-Host "  费用总数: $($feeList.data.total)" -ForegroundColor Cyan

# ============ 7. 创建测试维修工单 ============
Write-Host "`n========== 6. 创建测试维修工单 ==========" -ForegroundColor Cyan

$maintenanceTypes = @("plumbing", "electrical", "appliance", "structural", "other")
$maintenanceTypeNames = @{
    "plumbing" = "水管维修"
    "electrical" = "电路维修"
    "appliance" = "家电维修"
    "structural" = "结构维修"
    "other" = "其他"
}
$maintenanceStatuses = @("pending", "pending", "processing", "completed")

$maintenanceRequests = @(
    @{ description = "卫生间水龙头漏水，需要更换"; type = "plumbing"; urgent = $true }
    @{ description = "空调不制冷，可能是缺氟"; type = "appliance"; urgent = $false }
    @{ description = "厨房插座接触不良，有火花"; type = "electrical"; urgent = $true }
    @{ description = "门锁损坏，需要更换锁芯"; type = "other"; urgent = $false }
    @{ description = "窗户关不严，漏风"; type = "structural"; urgent = $false }
    @{ description = "马桶冲水不畅"; type = "plumbing"; urgent = $false }
    @{ description = "热水器不加热"; type = "appliance"; urgent = $true }
    @{ description = "灯泡闪烁，需要检查线路"; type = "electrical"; urgent = $false }
)

foreach ($request in $maintenanceRequests) {
    $maintenanceData = @{
        tenantId = $createdTenants[(Get-Random -Minimum 0 -Maximum $createdTenants.Count)].id
        roomNo = "A-10$(Get-Random -Minimum 1 -Maximum 4)"
        type = $request.type
        description = $request.description
        urgent = $request.urgent
        status = $maintenanceStatuses[(Get-Random -Minimum 0 -Maximum $maintenanceStatuses.Count)]
    }

    try {
        $result = Invoke-RestMethod -Uri "$BASE_URL/maintenance" -Method POST -Headers $headers -Body ($maintenanceData | ConvertTo-Json)
        if ($result.code -eq 0) {
            Write-Host "  ✓ 创建维修工单: $($request.description.Substring(0, [Math]::Min(20, $request.description.Length)))..." -ForegroundColor Green
        }
    } catch {
        Write-Host "  ✗ 创建维修工单失败" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 100
}

# 获取维修工单统计
$maintenanceList = Invoke-RestMethod -Uri "$BASE_URL/maintenance?page=1&pageSize=1" -Method GET -Headers $headers
Write-Host "  维修工单总数: $($maintenanceList.data.total)" -ForegroundColor Cyan

# ============ 8. 测试缴费流程 ============
Write-Host "`n========== 7. 测试缴费流程 ==========" -ForegroundColor Cyan

# 获取一条待缴费记录
$unpaidFees = Invoke-RestMethod -Uri "$BASE_URL/fees?page=1&pageSize=50&status=unpaid" -Method GET -Headers $headers
if ($unpaidFees.data.list.Count -gt 0) {
    $testFee = $unpaidFees.data.list[0]
    Write-Host "  测试缴费: ID=$($testFee.id), 金额=$($testFee.amount), 类型=$($testFee.feeType)" -ForegroundColor Cyan

    try {
        $payResult = Invoke-RestMethod -Uri "$BASE_URL/fees/$($testFee.id)/pay" -Method POST -Headers $headers -Body '{"paidDate":"2026-05-06"}'
        if ($payResult.code -eq 0) {
            Write-Host "  ✓ 缴费成功! (模拟租户端付款)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ 缴费失败: $($payResult.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ⚠ 缴费API调用失败（后端路由可能未更新）" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ 没有待缴费记录" -ForegroundColor Yellow
}

# ============ 9. 测试租户端API ============
Write-Host "`n========== 8. 测试租户端API ==========" -ForegroundColor Cyan

# 获取一个租户用户的token（如果有的话）
# 先检查有哪些用户
$userList = Invoke-RestMethod -Uri "$BASE_URL/users?page=1&pageSize=50" -Method GET -Headers $headers
$regularUser = $userList.data.list | Where-Object { $_.role -eq "user" } | Select-Object -First 1

if ($regularUser) {
    Write-Host "  找到租户用户: $($regularUser.username)" -ForegroundColor Cyan

    # 尝试用该用户登录
    try {
        $userLogin = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -ContentType "application/json" -Body "{`"username`":`"$($regularUser.username)`",`"password`":`"123456`"}"
        $userToken = $userLogin.data.token
        $userHeaders = @{
            "Authorization" = "Bearer $userToken"
        }

        Write-Host "  ✓ 租户用户登录成功" -ForegroundColor Green

        # 测试租户端API
        Write-Host "  测试租户端账单列表..." -ForegroundColor Cyan
        $tenantFees = Invoke-RestMethod -Uri "$BASE_URL/tenant/fees?page=1&pageSize=10" -Method GET -Headers $userHeaders
        Write-Host "    账单数量: $($tenantFees.data.total)" -ForegroundColor White

        Write-Host "  测试租户端合同列表..." -ForegroundColor Cyan
        $tenantContracts = Invoke-RestMethod -Uri "$BASE_URL/tenant/contracts?page=1&pageSize=10" -Method GET -Headers $userHeaders
        Write-Host "    合同数量: $($tenantContracts.data.total)" -ForegroundColor White

        Write-Host "  测试租户端仪表盘..." -ForegroundColor Cyan
        $tenantDashboard = Invoke-RestMethod -Uri "$BASE_URL/tenant/dashboard" -Method GET -Headers $userHeaders
        Write-Host "    待付款: $($tenantDashboard.data.pendingFees) 笔, ¥$($tenantDashboard.data.pendingAmount)" -ForegroundColor White

    } catch {
        Write-Host "  ⚠ 无法测试租户端API（可能需要先设置租户用户密码）" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ 没有找到租户用户，请先在系统中创建" -ForegroundColor Yellow
}

# ============ 10. 测试管理端仪表盘 ============
Write-Host "`n========== 9. 测试管理端仪表盘 ==========" -ForegroundColor Cyan

$dashboard = Invoke-RestMethod -Uri "$BASE_URL/reports/dashboard" -Method GET -Headers $headers
if ($dashboard.code -eq 0) {
    Write-Host "  仪表盘数据:" -ForegroundColor Cyan
    Write-Host "    总租户数: $($dashboard.data.totalTenants)" -ForegroundColor White
    Write-Host "    总房间数: $($dashboard.data.totalRooms)" -ForegroundColor White
    Write-Host "    入住率: $([math]::Round($dashboard.data.occupancyRate, 2))%" -ForegroundColor White
    Write-Host "    活跃合同: $($dashboard.data.activeContracts)" -ForegroundColor White
    Write-Host "    待付款: $($dashboard.data.pendingFees) 笔, ¥$($dashboard.data.unpaidAmount)" -ForegroundColor White
    Write-Host "    待处理维修: $($dashboard.data.pendingMaintenance)" -ForegroundColor White
}

Write-Host "`n========== 测试完成 ==========" -ForegroundColor Green
Write-Host "所有测试数据已生成，系统流程已测试。" -ForegroundColor Green