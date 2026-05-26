import { z } from 'zod';

export const loginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确手机号'),
  password: z.string().min(6, '密码至少6位'),
});

export const smsLoginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确手机号'),
  code: z.string().length(4, '验证码为4位'),
});

export const registerSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确手机号'),
  password: z.string().min(6, '密码至少6位').max(32, '密码最长32位'),
  confirmPassword: z.string(),
  companyName: z.string().min(1, '请输入公司名称'),
  name: z.string().min(1, '请输入姓名'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
});

export const companySchema = z.object({
  name: z.string().min(1, '公司名称不能为空'),
  code: z.string().optional(),
  address: z.string().optional(),
  contact: z.string().optional(),
  phone: z.string().optional(),
  status: z.number().default(0),
});

export const shopSchema = z.object({
  name: z.string().min(1, '店铺名称不能为空'),
  code: z.string().optional(),
  platform: z.string().optional(),
  companyId: z.string().optional(),
  status: z.number().default(0),
});

export const skuSchema = z.object({
  skuName: z.string().min(1, 'SKU名称不能为空'),
  skuId: z.string().optional(),
  spuId: z.string().optional(),
  salePrice: z.number().positive('价格必须大于0'),
  categoryName: z.string().optional(),
  stock: z.number().int().default(0),
});
