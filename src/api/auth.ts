import { apiClient } from './client'
import type { ApiResponse, LoginPayload, LoginRequest } from './types'

export async function login(body: LoginRequest): Promise<ApiResponse<LoginPayload>> {
  const { data } = await apiClient.post<ApiResponse<LoginPayload>>('/digital-login', body)
  return data
}
