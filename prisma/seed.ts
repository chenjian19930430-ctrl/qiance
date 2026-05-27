import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 开始播种种子数据...")

  // 1. 创建默认租户
  const tenant = await prisma.tenant.upsert({
    where: { code: "DEFAULT" },
    update: {},
    create: {
      name: "厦门重构艺数科技有限公司",
      code: "DEFAULT",
    },
  })
  console.log(`✅ 租户: ${tenant.name}`)

  // 2. 创建超级管理员和角色
  const adminRole = await prisma.role.upsert({
    where: { code: "admin" },
    update: {},
    create: {
      name: "超级管理员",
      code: "admin",
      tenantId: tenant.id,
      sort: 0,
    },
  })

  const staffRole = await prisma.role.upsert({
    where: { code: "staff" },
    update: {},
    create: {
      name: "普通员工",
      code: "staff",
      tenantId: tenant.id,
      sort: 1,
    },
  })

  const hashedPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      realName: "管理员",
      tenantId: tenant.id,
    },
  })

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  })
  console.log(`✅ 管理员: admin / admin123`)

  // 3. 创建15个智能体
  const agents = [
    {
      code: "profit_predictor",
      name: "利润预测智能体",
      group: "finance",
      description: "未来销量、成本、费用、利润自动预测、目标达成模拟",
      prompt: `你是一位专业的电商利润预测分析师。你可以：
1. 根据历史销售数据预测未来销量趋势
2. 分析成本、费用结构并预测利润率
3. 进行"如果...会怎样"的目标达成模拟
请基于用户提供的店铺/商品数据进行分析。`,
    },
    {
      code: "tax_risk_scanner",
      name: "税务风险扫描智能体",
      group: "finance",
      description: "自动扫描收入申报/发票/税负率/三流一致风险",
      prompt: `你是一位专业税务风险分析师。你可以扫描收入申报与发票差异风险，分析税负率是否合理，检查三流一致，生成整改方案。`,
    },
    {
      code: "auto_reconciliation",
      name: "自动对账智能体",
      group: "finance",
      description: "订单/回款/退款/平台费自动对账",
      prompt: `你是一位财务对账专家。你可以自动处理订单金额与回款对账、退款对账、平台费对账，标记差异并生成调整建议。`,
    },
    {
      code: "cashflow_predictor",
      name: "现金流预测智能体",
      group: "finance",
      description: "7/30/90天现金流预测，缺口自动预警",
      prompt: `你是电商现金流管理专家。可以预测现金流，识别资金缺口并预警，提供资金调度建议。`,
    },
    {
      code: "tax_calculator",
      name: "税费自动测算智能体",
      group: "finance",
      description: "增值税/企业所得税自动计算，生成申报表草稿",
      prompt: `你是一位税务计算专家。可自动计税、生成申报草稿、提供筹划建议。`,
    },
    {
      code: "roi_calculator",
      name: "ROI保本智能体",
      group: "growth",
      description: "自动计算投流保本ROI，亏损自动预警",
      prompt: `你是投流ROI分析师。计算保本ROI，分析差距，提供优化建议。`,
    },
    {
      code: "budget_allocator",
      name: "预算分配智能体",
      group: "growth",
      description: "自动把预算分给高ROI计划/商品",
      prompt: `你是一位投流预算分配专家。基于ROI表现分配合适预算。`,
    },
    {
      code: "creative_optimizer",
      name: "人群素材优选智能体",
      group: "growth",
      description: "自动筛选高点击/高转化素材",
      prompt: `你是投流素材优化专家。分析素材表现，筛选高转化素材。`,
    },
    {
      code: "campaign_monitor",
      name: "投流监控智能体",
      group: "growth",
      description: "亏损达阈值自动暂停计划",
      prompt: `你是投流实时监控专家。监控消耗和ROI，达阈值暂停计划。`,
    },
    {
      code: "organic_traffic_booster",
      name: "自然流量提升智能体",
      group: "growth",
      description: "优化标题/关键词/SEO，提升自然流量",
      prompt: `你是电商SEO专家。优化商品标题关键词，提高搜索权重。`,
    },
    {
      code: "product_analyzer",
      name: "商品效能分析智能体",
      group: "product",
      description: "SKU级别效能分析，识别畅销/滞销品",
      prompt: `你是商品效能分析师。分析SKU的销量/利润/转化率，提供定价和促销建议。`,
    },
    {
      code: "competitor_monitor",
      name: "竞品监控智能体",
      group: "product",
      description: "竞品价格/销量监控，提供应对策略",
      prompt: `你是竞品分析专家。分析竞品价格策略、销量趋势，提供应对策略。`,
    },
    {
      code: "inventory_optimizer",
      name: "库存优化智能体",
      group: "product",
      description: "库存周转/补货建议，呆滞库存预警",
      prompt: `你是库存管理专家。分析周转率，识别呆滞库存，提供补货建议。`,
    },
    {
      code: "data_analyst",
      name: "数据分析智能体",
      group: "general",
      description: "自然语言查询数据，自动生成图表",
      prompt: `你是电商数据分析师。理解自然语言查询，自动生成图表，提供数据洞察。`,
    },
    {
      code: "ops_assistant",
      name: "运营助手智能体",
      group: "general",
      description: "日常运营问题解答，活动策划建议",
      prompt: `你是电商运营顾问。提供平台规则、活动策划、客服流程等方面的建议。`,
    },
  ]

  for (const agent of agents) {
    await prisma.agent.upsert({
      where: { code: agent.code },
      update: {},
      create: {
        ...agent,
        tenantId: tenant.id,
        sort: 0,
      },
    })
  }
  console.log(`✅ 15个智能体已创建`)

  // 4. 创建测试数据
  const company = await prisma.company.upsert({
    where: { id: "test-company-001" },
    update: {},
    create: {
      id: "test-company-001",
      tenantId: tenant.id,
      name: "测试公司",
      code: "TEST_COM",
      address: "福建省厦门市思明区",
      phone: "0592-1234567",
      contact: "陈经理",
      status: 0,
      creatorId: admin.id,
    },
  })

  const shop = await prisma.shop.upsert({
    where: { id: "test-shop-001" },
    update: {},
    create: {
      id: "test-shop-001",
      tenantId: tenant.id,
      companyId: company.id,
      name: "测试京东旗舰店A",
      code: "JD_SHOP_A",
      channel: "京东",
      status: 0,
      creatorId: admin.id,
    },
  })

  const category = await prisma.category.upsert({
    where: { id: "test-cat-001" },
    update: {},
    create: {
      id: "test-cat-001",
      tenantId: tenant.id,
      name: "测试类目",
      status: 0,
    },
  })

  // 创建200条SKU测试数据
  const skuCount = await prisma.sku.count()
  if (skuCount === 0) {
    const skus = []
    for (let i = 1; i <= 200; i++) {
      const spuId = `test-spu-${Math.ceil(i / 20)}`
      // 确保SPU存在
      await prisma.spu.upsert({
        where: { id: spuId },
        update: {},
        create: {
          id: spuId,
          tenantId: tenant.id,
          companyId: company.id,
          categoryId: category.id,
          name: `测试SPU-${Math.ceil(i / 20)}`,
          code: `TEST_SPU_${Math.ceil(i / 20)}`,
        },
      })
      skus.push({
        tenantId: tenant.id,
        spuId,
        shopId: shop.id,
        name: `测试SKU-${i}`,
        code: `TEST_SKU_${String(i).padStart(3, "0")}`,
        salePrice: Math.floor(Math.random() * 80) + 59,
        costPrice: Math.floor(Math.random() * 40) + 20,
        stock: Math.floor(Math.random() * 500) + 10,
        status: 0,
        spec: { color: ["红色", "蓝色", "白色"][i % 3], size: ["S", "M", "L", "XL"][i % 4] },
      })
    }
    await prisma.sku.createMany({ data: skus })
    console.log(`✅ 200条SKU测试数据已创建`)
  }

  // 创建部门
  const depts = [
    { name: "总经办", code: "CEO" },
    { name: "技术部", code: "TECH" },
    { name: "运营部", code: "OPS" },
    { name: "财务部", code: "FINANCE" },
  ]
  for (const d of depts) {
    await prisma.dept.upsert({
      where: { id: `dept-${d.code}` },
      update: {},
      create: {
        id: `dept-${d.code}`,
        tenantId: tenant.id,
        name: d.name,
        code: d.code,
      },
    })
  }

  // 创建岗位
  const posts = [
    { name: "CEO", code: "CEO" },
    { name: "技术经理", code: "TECH_MGR" },
    { name: "运营主管", code: "OPS_MGR" },
    { name: "财务主管", code: "FIN_MGR" },
    { name: "员工", code: "STAFF" },
  ]
  for (const p of posts) {
    await prisma.post.upsert({
      where: { code: p.code },
      update: {},
      create: {
        tenantId: tenant.id,
        name: p.name,
        code: p.code,
      },
    })
  }

  // ========== 供应链种子数据 ==========

  // 清空供应链表
  await prisma.stockItem.deleteMany()
  await prisma.purchaseOrderItem.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.warehouse.deleteMany()

  // 1. 创建仓库
  const warehouseMain = await prisma.warehouse.create({
    data: { name: "主仓", code: "WH-MAIN", address: "厦门市思明区软件园二期", contact: "陈经理", phone: "0592-1234567", status: 0, tenantId: "default" },
  })
  const warehouseNorth = await prisma.warehouse.create({
    data: { name: "华北仓", code: "WH-NORTH", address: "北京市大兴区", contact: "张经理", phone: "010-7654321", status: 0, tenantId: "default" },
  })
  console.log(`✅ 2个仓库已创建`)

  // 2. 创建采购单
  const allSuppliers = await prisma.supplier.findMany({ take: 5 })
  const statuses = [0, 0, 1, 1, 2, 2, 3, 4, 4, 5]
  const poData = [
    { spuName: "纯棉T恤", spec: "白色-M", qty: 500, price: 2500 },
    { spuName: "运动鞋", spec: "黑色-42", qty: 200, price: 8000 },
    { spuName: "无线耳机", spec: "Pro版", qty: 100, price: 15000 },
    { spuName: "手机壳", spec: "透明款", qty: 1000, price: 800 },
    { spuName: "保温杯", spec: "500ml-白色", qty: 300, price: 3500 },
    { spuName: "书包", spec: "蓝色", qty: 150, price: 8900 },
    { spuName: "零食礼盒", spec: "端午限定", qty: 200, price: 12800 },
    { spuName: "电脑包", spec: "15.6寸-黑色", qty: 80, price: 6500 },
    { spuName: "防晒霜", spec: "SPF50-60ml", qty: 400, price: 3900 },
    { spuName: "瑜伽垫", spec: "6mm-紫色", qty: 250, price: 2800 },
  ]

  for (let i = 0; i < 10; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (10 - i))
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "")
    const supplier = allSuppliers[i % allSuppliers.length]
    if (!supplier) continue

    const item = poData[i]
    const totalAmount = item.qty * item.price
    const receivedQty = [3, 4].includes(statuses[i]) ? item.qty : statuses[i] === 3 ? Math.floor(item.qty * 0.6) : 0

    const order = await prisma.purchaseOrder.create({
      data: {
        orderNo: `PO-${dateStr}-${String(i + 1).padStart(3, "0")}`,
        supplierId: supplier.id,
        status: statuses[i],
        totalAmount,
        remark: `种子数据示例采购单 #${i + 1}`,
        creator: "admin",
        createdAt: d,
        items: {
          create: [{
            spuName: item.spuName,
            skuSpec: item.spec,
            quantity: item.qty,
            price: item.price,
            receivedQty,
          }],
        },
      },
    })
  }
  console.log(`✅ 10条采购单已创建`)

  // 3. 创建库存记录
  const allSkus = await prisma.sku.findMany({ take: 30, include: { spu: true } })
  const whIds = [warehouseMain.id, warehouseNorth.id]

  for (let i = 0; i < 30 && i < allSkus.length; i++) {
    const sku = allSkus[i]
    const qty = Math.floor(Math.random() * 500) + 5
    const threshold = [50, 30, 100, 20][Math.floor(Math.random() * 4)]
    const specVal = sku.spec ? JSON.stringify(sku.spec) : null

    await prisma.stockItem.create({
      data: {
        skuId: sku.id,
        skuCode: sku.code,
        spuName: sku.name,
        skuSpec: specVal,
        warehouseId: whIds[i % 2],
        quantity: qty,
        locked: Math.floor(qty * 0.05),
        threshold,
        unit: "个",
        tenantId: "default",
      },
    })
  }
  console.log(`✅ 30条库存记录已创建`)

  console.log("🎉 种子数据播种完成！")
  console.log("   管理员账号: admin / admin123")
  console.log("   租户: 厦门重构艺数科技有限公司")
  console.log("   供应链: 2仓库 + 10采购单 + 30库存项")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
