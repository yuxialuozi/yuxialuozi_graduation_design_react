#!/bin/bash

# 修复费用数据的 paid_date
BASE_URL="http://localhost:8080/api"

echo "=== 1. 登录获取Token ==="
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "登录失败，无法获取token"
  exit 1
fi

echo "✅ Token获取成功"

echo ""
echo "=== 2. 获取所有已支付的记录 ==="
PAGE=1
PAGE_SIZE=50
TOTAL=0
UPDATED=0

while true; do
  response=$(curl -s -X GET "$BASE_URL/fees?status=paid&page=$PAGE&pageSize=$PAGE_SIZE" \
    -H "Authorization: Bearer $TOKEN")

  count=$(echo "$response" | grep -o '"total":[0-9]*' | head -1 | cut -d':' -f2)

  if [ -z "$count" ] || [ "$count" -eq 0 ]; then
    break
  fi

  ids=$(echo "$response" | grep -o '"id":[0-9]*' | cut -d':' -f2)

  if [ -z "$ids" ]; then
    break
  fi

  for id in $ids; do
    # 获取费用详情
    fee_detail=$(curl -s -X GET "$BASE_URL/fees/$id" \
      -H "Authorization: Bearer $TOKEN")

    # 检查 paidDate 是否为 null
    paid_date=$(echo "$fee_detail" | grep -o '"paidDate":null')

    if [ -n "$paid_date" ]; then
      # 获取 dueDate
      due_date=$(echo "$fee_detail" | grep -o '"dueDate":"[^"]*"' | head -1 | cut -d'"' -f4)

      # 更新费用记录，设置 paidDate
      update_response=$(curl -s -X PUT "$BASE_URL/fees/$id" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"paidDate\":\"$due_date\"}")

      UPDATED=$((UPDATED + 1))
      echo "✅ 更新费用 $id: paidDate = $due_date"
    fi
  done

  TOTAL=$((TOTAL + count))
  echo "📊 已处理 $TOTAL 条记录"

  # 如果获取的记录数少于页面大小，说明没有更多数据了
  if [ "$count" -lt "$PAGE_SIZE" ]; then
    break
  fi

  PAGE=$((PAGE + 1))
done

echo ""
echo "=== ✅ 数据修复完成 ==="
echo "总计: $TOTAL 条记录"
echo "更新: $UPDATED 条记录"