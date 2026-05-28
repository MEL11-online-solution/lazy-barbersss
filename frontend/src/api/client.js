import axios from 'axios';

/**
 * Axios instance with cookie credentials and envelope unwrapping.
 *
 * The backend always returns:
 *   success: { ok: true, data, meta? }
 *   error:   { ok: false, error: { code, message, details? } }
 *
 * The interceptor below normalizes responses so callers get:
 *   - on success → res.data === <data payload>, res.meta === <meta>
 *   - on error → throws an Error with .code, .message, .details, .status
 */
const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true, // include httpOnly auth cookie
  headers: { 'Content-Type': 'application/json' },
});

class ApiError extends Error {
  constructor({ code, message, details, status }) {
    super(message || 'Request failed');
    this.name = 'ApiError';
    this.code = code || 'UNKNOWN';
    this.details = details;
    this.status = status;
  }
}

client.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && body.ok === true) {
      // Replace response.data with the inner payload, but stash meta on the response object.
      response.data = body.data;
      response.meta = body.meta;
      return response;
    }
    // Defensive: server returned non-envelope OK
    return response;
  },
  (error) => {
    if (error.response) {
      const body = error.response.data;
      if (body && body.error) {
        return Promise.reject(
          new ApiError({
            code: body.error.code,
            message: body.error.message,
            details: body.error.details,
            status: error.response.status,
          })
        );
      }
      return Promise.reject(
        new ApiError({
          code: 'HTTP_' + error.response.status,
          message: 'Request failed',
          status: error.response.status,
        })
      );
    }
    return Promise.reject(
      new ApiError({
        code: 'NETWORK_ERROR',
        message: error.message || 'Network error',
      })
    );
  }
);

export { client, ApiError };
export default client;
