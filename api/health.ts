import { successResponse } from './lib/response.js'
import { handleCors } from './lib/cors.js'

export async function GET(request: Request) {
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  return successResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}

