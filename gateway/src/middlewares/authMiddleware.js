const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authorization token is required' },
    });
  }

  // En un caso real, aquí se verificaría el JWT
  // Por ahora solo pasamos al siguiente middleware
  req.user = { id: 'mock-user-id', role: 'user' };
  next();
};

module.exports = authMiddleware;
