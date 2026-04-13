// API client configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

class ApiClient {
  private baseURL: string
  private isRefreshing: boolean = false
  private refreshPromise: Promise<boolean> | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  /**
   * Get CSRF token from cookie
   */
  private getCSRFToken(): string | null {
    const match = document.cookie.match(new RegExp('(^| )csrf_token=([^;]+)'))
    return match ? match[2] : null
  }

  /**
   * Get common headers for all requests
   */
  private getHeaders(method: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Add CSRF token for state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = this.getCSRFToken()
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken
      }
    }

    return headers
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        // Only trigger refresh if not already refreshing
        if (!this.isRefreshing) {
          // Trigger refresh token flow via custom event
          window.dispatchEvent(new CustomEvent('auth:unauthorized'))
        }
        throw new Error(errorData.message || 'Session expired. Please login again.')
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new Error(errorData.message || 'Access denied')
      }

      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`)
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key])
        }
      })
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include', // Important for HTTP-only cookies
      headers: this.getHeaders('GET'),
    })

    return this.handleResponse<T>(response)
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      credentials: 'include', // Important for HTTP-only cookies
      headers: this.getHeaders('POST'),
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      credentials: 'include',
      headers: this.getHeaders('PUT'),
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: this.getHeaders('PATCH'),
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: this.getHeaders('DELETE'),
    })

    return this.handleResponse<T>(response)
  }

  /**
   * Set refresh state (called by auth store)
   */
  setRefreshingState(isRefreshing: boolean) {
    this.isRefreshing = isRefreshing
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Helper to simulate API delay for mock data
export const mockDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
