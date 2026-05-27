"use client"

import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { z } from "zod"
import { toast } from "sonner"

export interface FieldConfig {
  name: string
  label: string
  type: "text" | "number" | "select" | "textarea" | "switch" | "date" | "tree" | "phone"
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string | number }[]
  defaultValue?: unknown
  hidden?: boolean
  disabled?: boolean
}

export interface CrudFormProps<T> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields: FieldConfig[]
  values?: Partial<T>
  onSubmit: (values: Record<string, unknown>) => Promise<void>
  loading?: boolean
  schema?: z.ZodSchema
  submitText?: string
  cancelText?: string
  /**
   * 表单布局：2列或1列
   */
  columns?: 1 | 2
  /**
   * 额外底部内容
   */
  footer?: React.ReactNode
  /**
   * 字段值变化回调
   */
  onFieldChange?: (name: string, value: unknown) => void
}

/**
 * 通用CRUD表单弹窗组件
 * 支持响应式，移动端自动切换为 Drawer
 */
export function CrudForm<T>({
  open,
  onOpenChange,
  title,
  description,
  fields,
  values = {},
  onSubmit,
  loading = false,
  submitText = "保存",
  cancelText = "取消",
  columns = 1,
  footer,
  onFieldChange,
}: CrudFormProps<T>) {
  const [formValues, setFormValues] = useState<Record<string, unknown>>(
    () => {
      const initial: Record<string, unknown> = {}
      fields.forEach((f) => {
        initial[f.name] =
          values[f.name as keyof T] ?? f.defaultValue ?? ""
      })
      return initial
    }
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const updateField = useCallback(
    (name: string, value: unknown) => {
      setFormValues((prev) => ({ ...prev, [name]: value }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
      onFieldChange?.(name, value)
    },
    [onFieldChange]
  )

  const handleSubmit = async () => {
    // Validate required
    const newErrors: Record<string, string> = {}
    fields.forEach((f) => {
      if (f.required && !formValues[f.name] && formValues[f.name] !== 0) {
        newErrors[f.name] = `${f.label}不能为空`
      }
    })
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await onSubmit(formValues)
      toast.success(submitText === "保存" ? "保存成功" : `${submitText}成功`)
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "操作失败"
      )
    }
  }

  const renderField = (field: FieldConfig) => {
    const value = formValues[field.name] as string
    const error = errors[field.name]
    const baseClass =
      "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            disabled={field.disabled || loading}
            className={`${baseClass} min-h-[80px] resize-y`}
          />
        )
      case "select":
        return (
          <select
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            disabled={field.disabled || loading}
            className={baseClass}
          >
            <option value="">请选择{field.label}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )
      case "number":
        return (
          <input
            type="number"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) =>
              updateField(field.name, e.target.value === "" ? "" : Number(e.target.value))
            }
            disabled={field.disabled || loading}
            className={baseClass}
          />
        )
      default:
        return (
          <input
            type={field.type === "phone" ? "tel" : "text"}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            disabled={field.disabled || loading}
            className={baseClass}
          />
        )
    }
  }

  const formContent = (
    <div
      className={`grid gap-4 py-4 ${
        columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
      }`}
    >
      {fields
        .filter((f) => !f.hidden)
        .map((field) => (
          <div key={field.name} className="space-y-2">
            <label className="text-sm font-medium">
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </label>
            {renderField(field)}
            {errors[field.name] && (
              <p className="text-xs text-destructive">{errors[field.name]}</p>
            )}
          </div>
        ))}
    </div>
  )

  const actionButtons = (
    <>
      <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
        {cancelText}
      </Button>
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "处理中..." : submitText}
      </Button>
    </>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {formContent}
          <DialogFooter>
            {footer}
            {actionButtons}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="px-4">{formContent}</div>
        <DrawerFooter>{actionButtons}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
