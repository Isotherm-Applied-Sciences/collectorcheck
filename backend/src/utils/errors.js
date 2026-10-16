export function sendError(response, status, message, code) {
  return response.status(status).json({
    error: { code: code || 'REQUEST_ERROR', message }
  });
}

export function notFound(request, response) {
  return sendError(response, 404, 'Route not found.', 'NOT_FOUND');
}

export function handleError(error, request, response, next) {
  if (response.headersSent) return next(error);

  if (error.code === 'LIMIT_FILE_SIZE') {
    return sendError(response, 413, 'File exceeds maximum size.', 'FILE_TOO_LARGE');
  }
  if (error.code === 'INVALID_FILE_TYPE') {
    return sendError(response, 400, 'File type not allowed.', 'INVALID_FILE_TYPE');
  }
  if (error instanceof SyntaxError && 'body' in error) {
    return sendError(response, 400, 'Invalid JSON request body.', 'INVALID_JSON');
  }
  return sendError(response, 500, 'An unexpected server error occurred.', 'INTERNAL_ERROR');
}