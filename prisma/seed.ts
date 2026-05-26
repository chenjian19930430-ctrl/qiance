import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始播种数据...');

  // 1. 创建默认租户
  const tenant = await prisma.tenant.upsert({
    where: { code: 'QIANCE_DEFAULT' },
    update: {},
    create: {
      name: '厦门重构艺数科技有限公司',
      code: 'QIANCE_DEFAULT',
      status: 0,
    },
  });
  console.log(`✅ 租户: ${tenant.name}`);

  // 2. 创建管理员角色
  const adminRole = await prisma.role.upsert({
    where: { code: 'super_admin' },
    update: {},
    create: {
      name: '超级管理员',
      code: 'super_admin',
      tenantId: tenant.id,
      status: 0,
    },
  });
  console.log(`✅ 角色: ${adminRole.name}`);

  // 3. 创建管理员用户
  const hashedPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '18649627971' },
    update: {},
    create: {
      phone: '18649627971',
      password: hashedPassword,
      name: '管理员',
      tenantId: tenant.id,
      roleId: adminRole.id,
      status: 0,
    },
  });
  console.log(`✅ 管理员: ${admin.name} (18649627971 / admin123)`);

  // 4. 创建默认公司
  const company = await prisma.company.upsert({
    where: { code: 'QIANCE_DEFAULT_CO' },
    update: {},
    create: {
      name: '厦门重构艺数科技有限公司',
      code: 'QIANCE_DEFAULT_CO',
      tenantId: tenant.id,
      status: 0,
    },
  });
  console.log(`✅ 公司: ${company.name}`);

  // 5. 创建默认店铺
  const shop = await prisma.shop.upsert({
    where: { code: 'QIANCE_DEFAULT_SHOP' },
    update: {},
    create: {
      name: '千策测试店铺',
      code: 'QIANCE_DEFAULT_SHOP',
      platform: '综合平台',
      companyId: company.id,
      tenantId: tenant.id,
      status: 0,
    },
  });
  console.log(`✅ 店铺: ${shop.name}`);

  // 6. 创建测试类目
  const category = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: '测试类目',
      tenantId: tenant.id,
    },
  });
  console.log(`✅ 类目: ${category.name}`);

  // 7. 创建200个测试SKU
  const existingCount = await prisma.sku.count();
  if (existingCount < 200) {
    const skus = [];
    for (let i = existingCount + 1; i <= 200; i++) {
      const price = Math.floor(Math.random() * 80) + 59; // ¥59-¥138
      const skuId = `JD-SKU-${String(i).padStart(5, '0')}`;
      skus.push({
        skuName: `2026测试商品-JD-${String(i).padStart(5, '0')}`,
        skuId,
        salePrice: price,
        categoryName: '测试类目',
        tenantId: tenant.id,
      });
    }

    for (const sku of skus) {
      await prisma.sku.create({ data: sku });
    }
    console.log(`✅ 新建 ${skus.length} 个SKU (共计 ${existingCount + skus.length} 个)`);
  } else {
    console.log(`✅ SKU已存在: ${existingCount} 个`);
  }

  // 8. 创建15个智能体（投流增长/商品管理/财税管理/通用）
  const agents = [
    // 商品管理
    { name: 'AI商品企划', category: '商品管理', description: '智能分析市场趋势，制定商品企划策略', keywords: '商品企划,新品规划' },
    { name: '智能选品', category: '商品管理', description: '数据驱动的智能选品决策支持', keywords: '智能选品,选品分析' },
    { name: '品类优化', category: '商品管理', description: '优化商品类目结构，提升运营效率', keywords: '品类优化,类目调整' },
    // 投流增长
    { name: '利润预测', category: '投流增长', description: 'AI驱动利润预测，优化定价策略', keywords: '利润预测,盈利分析' },
    { name: '付费推广', category: '投流增长', description: '智能投放策略，提升ROI', keywords: '付费推广,广告投放' },
    { name: '流量预测', category: '投流增长', description: '预测流量趋势，把握营销时机', keywords: '流量预测,流量趋势' },
    { name: '爆款预测', category: '投流增长', description: 'AI识别潜力爆款，抢占市场先机', keywords: '爆款预测,爆品分析' },
    { name: '市场分析', category: '投流增长', description: '行业趋势洞察与竞争分析', keywords: '市场分析,行业趋势' },
    // 财税管理
    { name: '税务风险扫描', category: '财税管理', description: '全面扫描税务风险，保障合规经营', keywords: '税务风险,税务合规' },
    { name: 'AI成本分析', category: '财税管理', description: '精细化成本核算，挖掘降本空间', keywords: '成本分析,成本核算' },
    { name: '营收分析', category: '财税管理', description: '全方位营收透视，驱动增长决策', keywords: '营收分析,收入分析' },
    { name: '财务对账', category: '财税管理', description: '智能对账，确保账实相符', keywords: '财务对账,对账分析' },
    { name: '利润分析', category: '财税管理', description: '利润来源追踪，优化盈利结构', keywords: '利润分析,利润结构' },
    { name: '凭证生成', category: '财税管理', description: '自动生成会计凭证，提升财务效率', keywords: '凭证生成,会计凭证' },
    { name: '税费测算', category: '财税管理', description: '智能税费测算，提前规划税负', keywords: '税费测算,税务计算' },
    // 通用
    { name: 'AI全能助理', category: '通用', description: '通用AI助手，解答各类电商运营问题', keywords: '全能助理,ai助手' },
    { name: '千问百答', category: '通用', description: '海量电商知识库，有问必答', keywords: '千问百答,电商知识' },
  ];

  let agentCount = 0;
  for (const agentData of agents) {
    const existing = await prisma.agent.findFirst({
      where: { name: agentData.name },
    });
    if (!existing) {
      await prisma.agent.create({
        data: {
          name: agentData.name,
          category: agentData.category,
          description: agentData.description,
          keywords: agentData.keywords,
          icon: 'Bot',
          color: '#4F46E5',
          promptTemplate: `你是一个${agentData.name}，${agentData.description}。请专业地回答用户的问题。`,
          tenantId: tenant.id,
          status: 0,
          sort: 0,
        },
      });
      agentCount++;
    }
  }
  console.log(`✅ 新建 ${agentCount} 个智能体`);

  // 9. 创建基础系统岗位
  const posts = [
    { code: 'ceo', name: '董事长', sort: 1, level: 1, category: '管理' },
    { code: 'se', name: '项目经理', sort: 2, level: 2, category: '管理' },
    { code: 'hr', name: '人力资源', sort: 3, level: 3, category: '职能' },
    { code: 'staff', name: '普通员工', sort: 4, level: 4, category: '职能' },
  ];

  let postCount = 0;
  for (const postData of posts) {
    const existing = await prisma.post.findFirst({
      where: { code: postData.code },
    });
    if (!existing) {
      await prisma.post.create({
        data: {
          ...postData,
          tenantId: tenant.id,
          status: 0,
        },
      });
      postCount++;
    }
  }
  console.log(`✅ 新建 ${postCount} 个岗位`);

  console.log('\n🎉 数据播种完成!');
  console.log('📱 管理账号: 18649627971 / admin123');
}

main()
  .catch((e) => {
    console.error('播种失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
