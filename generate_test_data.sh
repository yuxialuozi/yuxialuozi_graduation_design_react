#!/bin/bash

# 测试数据生成脚本
# 基础URL和Token
BASE_URL="http://localhost:8080/api"

# 先登录获取token
echo "=== 1. 登录获取Token ==="
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "登录失败，无法获取token"
  exit 1
fi

echo "✅ Token获取成功: ${TOKEN:0:30}..."

# 租户名称列表
TENANTS=(
  "张三丰" "李四光" "王五常" "赵六安" "钱七多"
  "孙八龙" "周九凤" "吴十虎" "郑十一" "王十二"
  "冯十三" "陈十四" "褚十五" "卫十六" "蒋十七"
  "沈十八" "韩十九" "杨二十" "朱二一" "秦二二"
  "尤二三" "许二四" "何二五" "吕二六" "施二七"
  "张二八" "孔二九" "曹三十" "严三一" "华三二"
  "金三三" "魏三四" "陶三五" "姜三六" "戚三七"
  "谢三八" "邹三九" "喻四十" "柏四一" "水四二"
  "窦四三" "章四四" "云四五" "苏四六" "潘四七"
  "葛四八" "范四九" "彭五十" "郎五一" "鲁五二"
)

# 创建租户
echo ""
echo "=== 2. 创建租户数据 ==="
TENANT_IDS=()
for i in {0..49}; do
  NAME="${TENANTS[$i]}"
  CONTACT="${NAME:0:1}先生"
  PHONE="138$(printf '%08d' $((i+10000000)))"
  EMAIL="tenant$((i+1))@example.com"

  RESPONSE=$(curl -s -X POST "$BASE_URL/tenants" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"$NAME\",
      \"contactPerson\": \"$CONTACT\",
      \"phone\": \"$PHONE\",
      \"email\": \"$EMAIL\",
      \"status\": \"active\"
    }")

  TENANT_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  if [ -n "$TENANT_ID" ]; then
    TENANT_IDS+=($TENANT_ID)
    echo "✅ 租户 $((i+1))/50: $NAME (ID: $TENANT_ID)"
  else
    echo "❌ 租户 $((i+1))/50: $NAME 创建失败"
  fi
done

echo "✅ 成功创建 ${#TENANT_IDS[@]} 个租户"

# 创建房间
echo ""
echo "=== 3. 创建房间数据 ==="
ROOM_IDS=()
BUILDINGS=("A栋" "B栋" "C栋")
FLOORS=(1 2 3 4 5 6)

for i in {0..59}; do
  BUILDING="${BUILDINGS[$((i % 3))]}"
  FLOOR="${FLOORS[$((i % 6))]}"
  ROOM_NUM="${BUILDING:0:1}-$(printf '%02d' $FLOOR)$(printf '%02d' $(((i / 6) % 10) + 1))"
  AREA=$((40 + (i % 10) * 5))
  RENT=$((2000 + (i % 10) * 200))

  RESPONSE=$(curl -s -X POST "$BASE_URL/rooms" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"roomNo\": \"$ROOM_NUM\",
      \"building\": \"$BUILDING\",
      \"floor\": $FLOOR,
      \"area\": $AREA,
      \"monthlyRent\": $RENT,
      \"status\": \"vacant\"
    }")

  ROOM_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  if [ -n "$ROOM_ID" ]; then
    ROOM_IDS+=($ROOM_ID)
    echo "✅ 房间 $((i+1))/60: $ROOM_NUM (ID: $ROOM_ID)"
  else
    echo "❌ 房间 $((i+1))/60: $ROOM_NUM 创建失败"
  fi
done

echo "✅ 成功创建 ${#ROOM_IDS[@]} 个房间"

# 创建合同
echo ""
echo "=== 4. 创建合同数据 ==="
CONTRACT_IDS=()
for i in {0..49}; do
  TENANT_ID="${TENANT_IDS[$i]}"
  CONTRACT_NUM="CT2025$(printf '%04d' $((i+1)))"
  START_DATE="2025-01-01"
  END_DATE="2025-12-31"
  AMOUNT=$((24000 + (i % 10) * 2000))
  STATUS="active"

  RESPONSE=$(curl -s -X POST "$BASE_URL/contracts" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"tenantId\": $TENANT_ID,
      \"contractNo\": \"$CONTRACT_NUM\",
      \"startDate\": \"$START_DATE\",
      \"endDate\": \"$END_DATE\",
      \"amount\": $AMOUNT,
      \"status\": \"$STATUS\"
    }")

  CONTRACT_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  if [ -n "$CONTRACT_ID" ]; then
    CONTRACT_IDS+=($CONTRACT_ID)
    echo "✅ 合同 $((i+1))/50: $CONTRACT_NUM (ID: $CONTRACT_ID)"
  else
    echo "❌ 合同 $((i+1))/50: $CONTRACT_NUM 创建失败"
  fi
done

echo "✅ 成功创建 ${#CONTRACT_IDS[@]} 个合同"

# 分配房间给租户
echo ""
echo "=== 5. 分配房间给租户 ==="
for i in {0..49}; do
  ROOM_ID="${ROOM_IDS[$i]}"
  TENANT_ID="${TENANT_IDS[$i]}"

  curl -s -X POST "$BASE_URL/rooms/$ROOM_ID/assign" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"tenantId\": $TENANT_ID}" > /dev/null

  echo "✅ 分配房间 $((i+1))/50: 房间ID $ROOM_ID -> 租户ID $TENANT_ID"
done

echo "✅ 成功分配 50 个房间"

# 创建费用记录
echo ""
echo "=== 6. 创建费用记录 ==="
FEE_TYPES=("rent" "water" "electricity" "property")
FEE_TYPE_NAMES=("租金" "水费" "电费" "物业费")

for i in {0..199}; do
  TENANT_INDEX=$((i % 50))
  TENANT_ID="${TENANT_IDS[$TENANT_INDEX]}"
  ROOM_ID="${ROOM_IDS[$TENANT_INDEX]}"

  FEE_TYPE_INDEX=$((i % 4))
  FEE_TYPE="${FEE_TYPES[$FEE_TYPE_INDEX]}"

  # 获取房间号
  ROOM_RESPONSE=$(curl -s -X GET "$BASE_URL/rooms/$ROOM_ID" \
    -H "Authorization: Bearer $TOKEN")
  ROOM_NO=$(echo $ROOM_RESPONSE | grep -o '"roomNo":"[^"]*"' | cut -d'"' -f4)

  # 费用金额
  case $FEE_TYPE in
    "rent") AMOUNT=$((2000 + TENANT_INDEX * 50)) ;;
    "water") AMOUNT=$((50 + TENANT_INDEX * 2)) ;;
    "electricity") AMOUNT=$((80 + TENANT_INDEX * 3)) ;;
    "property") AMOUNT=$((150 + TENANT_INDEX * 5)) ;;
  esac

  PERIOD="2025-$(printf '%02d' $(((i / 4) % 12) + 1))"
  DUE_DATE="2025-$(printf '%02d' $(((i / 4) % 12) + 1))-25"

  # 80%的费用已支付
  if [ $((i % 5)) -ne 0 ]; then
    STATUS="paid"
  else
    STATUS="unpaid"
  fi

  RESPONSE=$(curl -s -X POST "$BASE_URL/fees" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"tenantId\": $TENANT_ID,
      \"roomNo\": \"$ROOM_NO\",
      \"feeType\": \"$FEE_TYPE\",
      \"amount\": $AMOUNT,
      \"period\": \"$PERIOD\",
      \"dueDate\": \"$DUE_DATE\",
      \"status\": \"$STATUS\"
    }")

  if [ $(((i+1) % 10)) -eq 0 ]; then
    echo "✅ 费用记录 $((i+1))/200 创建完成"
  fi
done

echo "✅ 成功创建 200 条费用记录"

# 创建维修工单
echo ""
echo "=== 7. 创建维修工单 ==="
MAINTENANCE_TYPES=("electrical" "plumbing" "appliance" "furniture" "other")
PRIORITIES=("low" "medium" "high" "urgent")

for i in {0..99}; do
  TENANT_INDEX=$((i % 50))
  TENANT_ID="${TENANT_IDS[$TENANT_INDEX]}"
  ROOM_ID="${ROOM_IDS[$TENANT_INDEX]}"

  # 获取房间号
  ROOM_RESPONSE=$(curl -s -X GET "$BASE_URL/rooms/$ROOM_ID" \
    -H "Authorization: Bearer $TOKEN")
  ROOM_NO=$(echo $ROOM_RESPONSE | grep -o '"roomNo":"[^"]*"' | cut -d'"' -f4)

  TYPE="${MAINTENANCE_TYPES[$((i % 5))]}"
  PRIORITY="${PRIORITIES[$((i % 4))]}"

  DESCRIPTIONS=(
    "客厅灯不亮，需要更换灯泡"
    "卫生间水龙头漏水"
    "空调不制冷，需要检修"
    "衣柜门松动，需要维修"
    "门锁损坏，无法正常开关"
    "厨房抽油烟机故障"
    "浴室热水器不工作"
    "窗户密封条老化"
    "地板翘起需要修理"
    "墙面渗水需要处理"
  )

  DESCRIPTION="${DESCRIPTIONS[$((i % 10))]}"

  # 60%的工单已完成，30%处理中，10%待处理
  if [ $((i % 10)) -lt 6 ]; then
    STATUS="completed"
  elif [ $((i % 10)) -lt 9 ]; then
    STATUS="processing"
  else
    STATUS="pending"
  fi

  RESPONSE=$(curl -s -X POST "$BASE_URL/maintenance" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"tenantId\": $TENANT_ID,
      \"roomNo\": \"$ROOM_NO\",
      \"type\": \"$TYPE\",
      \"description\": \"$DESCRIPTION\",
      \"priority\": \"$PRIORITY\"
    }")

  if [ $(((i+1) % 20)) -eq 0 ]; then
    echo "✅ 维修工单 $((i+1))/100 创建完成"
  fi
done

echo "✅ 成功创建 100 条维修工单"

echo ""
echo "=== 测试数据创建完成 ==="
echo "📊 数据统计："
echo "  - 租户: ${#TENANT_IDS[@]} 个"
echo "  - 房间: ${#ROOM_IDS[@]} 个"
echo "  - 合同: ${#CONTRACT_IDS[@]} 个"
echo "  - 费用记录: 200 条"
echo "  - 维修工单: 100 条"
echo ""
echo "✅ 所有测试数据已成功插入系统！"
