const validateMembership = (req, res, next) => {
  const { name, price, duration } = req.body;

  if (!name || !price || !duration) {
    return res.status(400).json({
      success: false,
      error: { message: 'Name, price and duration are required' },
    });
  }

  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'Price must be a positive number' },
    });
  }

  next();
};

module.exports = validateMembership;
