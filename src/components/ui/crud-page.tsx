"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableProps } from "@/components/ui/data-table"
import { CrudForm, type FieldConfig } from "@/components/ui/crud-form"
import { Plus } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

export interface CrudPageProps<T> {
  title: string
  description?: string
  columns: ColumnDef<T>[]
  fields: FieldConfig[]
  fetchData: (params: {
    page: number
    pageSize: number
    search?: string
  }) => Promise<{ list: T[]; total: number }>
  onCreate?: (values: Record<string, unknown>) => Promise<void>
  onUpdate?: (id: string, values: Record<string, unknown>) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  getId: (row: T) => string
  searchable?: boolean
  searchPlaceholder?: string
  pageSize?: number
  extraToolbar?: React.ReactNode
  createTitle?: string
  updateTitle?: string
  emptyText?: string
  /**
   * 是否支持编辑
   */
  editable?: boolean
  /**
   * 是否支持删除
   */
  deletable?: boolean
  /**
   * 是否支持新增
   */
  creatable?: boolean
  /**
   * 批量操作按钮
   */
  batchActions?: React.ReactNode
  /**
   * 额外列定义（在操作列前插入）
   */
  extraColumns?: ColumnDef<T>[]
  /**
   * 行点击回调
   */
  onRowClick?: (row: T) => void
  /**
   * 获取编辑初始值
   */
  getEditValues?: (row: T) => Record<string, unknown>
  /**
   * 自定义操作列渲染
   */
  renderActions?: (row: T) => React.ReactNode
  /**
   * 表单提交前转换
   */
  transformSubmit?: (values: Record<string, unknown>) => Record<string, unknown>
  /**
   * 表单字段列数
   */
  formColumns?: 1 | 2
  /**
   * 过滤参数（额外传递给 fetchData）
   */
  filters?: Record<string, unknown>
}

/**
 * 通用CRUD页面组件
 * 封装了：搜索栏 + 数据表格 + 新增/编辑弹窗 + 删除确认
 */
export function CrudPage<T extends Record<string, unknown>>({
  title,
  description,
  columns,
  fields,
  fetchData,
  onCreate,
  onUpdate,
  onDelete,
  getId,
  searchable = true,
  searchPlaceholder = "搜索...",
  pageSize: defaultPageSize = 20,
  extraToolbar,
  createTitle = "新增",
  updateTitle = "编辑",
  emptyText = "暂无数据",
  editable = true,
  deletable = true,
  creatable = true,
  batchActions,
  extraColumns,
  onRowClick,
  getEditValues,
  renderActions,
  transformSubmit,
  formColumns = 1,
  filters = {},
}: CrudPageProps<T>) {
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<T | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchData({
        page,
        pageSize,
        search: search || undefined,
        ...filters,
      })
      setData(result.list)
      setTotal(result.total)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "数据加载失败"
      )
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, fetchData, filters])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleCreate = () => {
    setEditRecord(null)
    setFormOpen(true)
  }

  const handleEdit = (row: T) => {
    setEditRecord(row)
    setFormOpen(true)
  }

  const handleDelete = async (row: T) => {
    const id = getId(row)
    setDeletingId(id)
    try {
      await onDelete?.(id)
      toast.success("删除成功")
      loadData()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "删除失败"
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true)
    try {
      const transformed = transformSubmit ? transformSubmit(values) : values
      if (editRecord) {
        await onUpdate?.(getId(editRecord), transformed)
      } else {
        await onCreate?.(transformed)
      }
      loadData()
    } finally {
      setSubmitting(false)
    }
  }

  // Build action column if editable or deletable
  const allColumns: ColumnDef<T>[] = [
    ...(extraColumns || []),
    ...columns,
    ...(editable || deletable || renderActions
      ? [
          {
            id: "actions",
            header: "操作",
            cell: ({ row }: { row: { original: T } }) => {
              if (renderActions) {
                return renderActions(row.original)
              }
              return (
                <div className="flex items-center gap-2">
                  {editable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(row.original)
                      }}
                    >
                      编辑
                    </Button>
                  )}
                  {deletable && onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={async (e) => {
                        e.stopPropagation()
                        await handleDelete(row.original)
                      }}
                      disabled={deletingId === getId(row.original)}
                    >
                      {deletingId === getId(row.original) ? "删除中..." : "删除"}
                    </Button>
                  )}
                </div>
              )
            },
          } as ColumnDef<T>,
        ]
      : []),
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && (
            <p className="text-muted-foreground text-sm mt-1">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {batchActions}
          {creatable && (onCreate) && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {createTitle}
            </Button>
          )}
        </div>
      </div>

      <DataTable
        columns={allColumns}
        data={data}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        searchValue={search}
        onSearchChange={handleSearch}
        loading={loading}
        emptyText={emptyText}
        onRowClick={onRowClick}
      />

      {/* Edit/Create Form */}
      {creatable && (onCreate || onUpdate) && (
        <CrudForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editRecord ? `${updateTitle}` : `${createTitle}`}
          fields={fields}
          values={
            editRecord && getEditValues
              ? getEditValues(editRecord) as Record<string, unknown>
              : {}
          }
          onSubmit={handleSubmit}
          loading={submitting}
          columns={formColumns}
        />
      )}
    </div>
  )
}
