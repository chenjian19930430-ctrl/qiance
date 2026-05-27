/**
 * 千策 API 请求封装
 * 统一 fetch 封装，支持错误处理、分页参数、loading态
 */

const BASE_URL = ""

interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  [key: string]: unknown
}

class ApiError extends Error {
  code: number
  constructor(message: string, code: number) {
    super(message)
    this.code = code
    this.name = "ApiError"
  }
}

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    })

    if (!res.ok) {
      throw new ApiError(`HTTP ${res.status}: ${res.statusText}`, res.status)
    }

    const json: ApiResponse<T> = await res.json()

    if (json.code !== 200) {
      throw new ApiError(json.message || "请求失败", json.code)
    }

    return json.data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new ApiError("网络连接失败，请检查网络", 0)
    }
    throw new ApiError(
      error instanceof Error ? error.message : "未知错误",
      -1
    )
  }
}

export const api = {
  get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const query = params
      ? "?" +
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== null && v !== "")
          .map(
            ([k, v]) =>
              `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
          )
          .join("&")
      : ""
    return request<T>(`${url}${query}`)
  },

  post<T>(url: string, data?: unknown): Promise<T> {
    return request<T>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  put<T>(url: string, data?: unknown): Promise<T> {
    return request<T>(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  delete<T>(url: string): Promise<T> {
    return request<T>(url, { method: "DELETE" })
  },

  upload<T>(url: string, formData: FormData): Promise<T> {
    return request<T>(url, {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set multipart boundary
    })
  },
}

/**
 * 分页查询封装
 */
export async function getPaginatedList<T>(
  url: string,
  params: PaginationParams & Record<string, unknown>
): Promise<PaginatedData<T>> {
  return api.get<PaginatedData<T>>(url, params)
}

export type { ApiResponse, PaginatedData }
