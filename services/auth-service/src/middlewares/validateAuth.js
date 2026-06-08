const validateAuth = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { message: 'Email and password are required' },
    });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid email format' },
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: { message: 'Password must be at least 6 characters' },
    });
  }

  next();
};

module.exports = validateAuth;
