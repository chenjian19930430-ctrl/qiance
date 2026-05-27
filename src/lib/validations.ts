import { z } from "zod"

// 登录表单验证
export const loginSchema = z.object({
  username: z.string().min(1, "请输入用户名"),
  password: z.string().min(6, "密码至少6位"),
})

export type LoginInput = z.infer<typeof loginSchema>

// 注册表单验证
export const registerSchema = z.object({
  username: z.string().min(3, "用户名至少3位"),
  password: z.string().min(6, "密码至少6位"),
  confirmPassword: z.string(),
  phone: z.string().regex(/^1[3-9]\d{9}$/, "手机号格式不正确"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次密码不一致",
  path: ["confirmPassword"],
})

export type RegisterInput = z.infer<typeof registerSchema>

// 通用分页参数
export const paginationSchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(20),
})

export type PaginationInput = z.infer<typeof paginationSchema>

// 用户创建表单
export const createUserSchema = z.object({
  username: z.string().min(3),
  realName: z.string().min(1, "请输入真实姓名"),
  password: z.string().min(6),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  roleIds: z.array(z.string()).optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
