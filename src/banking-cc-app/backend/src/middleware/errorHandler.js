// Centralized fallback error handler. Individual routes should catch and
// respond to expected errors themselves; this is the safety net for anything
// unexpected so the API never leaks a stack trace to the client.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error("[unhandled error]", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Internal server error" });
}

module.exports = { errorHandler };
