import { corsHeaders } from './cors.js'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export function successResponse<T>(data: T, message?: string, status = 200): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      ...(message && { message }),
    } as ApiResponse<T>),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  )
}

export function errorResponse(error: string, status = 400): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error,
    } as ApiResponse),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  )
}

