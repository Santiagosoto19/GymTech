const validateReport = (req, res, next) => {
  const { type, title } = req.body;

  if (!type || !title) {
    return res.status(400).json({
      success: false,
      error: { message: 'Type and title are required' },
    });
  }

  const validTypes = ['attendance', 'revenue', 'user-growth', 'activity'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      error: { message: `Type must be one of: ${validTypes.join(', ')}` },
    });
  }

  next();
};

module.exports = validateReport;
