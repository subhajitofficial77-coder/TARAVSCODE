/**
 * Helper function to verify the X-Internal-Token header for internal API calls
 */
export function verifyInternalToken(request: Request) {
  const token = request.headers.get('X-Internal-Token');
  const validToken = process.env.INTERNAL_API_TOKEN;

  if (!validToken) {
    throw new Error('INTERNAL_API_TOKEN not configured');
  }

  if (!token || token !== validToken) {
    throw new Error('Invalid or missing X-Internal-Token');
  }
}