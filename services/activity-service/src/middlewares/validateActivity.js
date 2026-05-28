const validateActivity = (req, res, next) => {
  const { name, instructor, schedule, capacity } = req.body;

  if (!name || !instructor || !schedule || !capacity) {
    return res.status(400).json({
      success: false,
      error: { message: 'Name, instructor, schedule and capacity are required' },
    });
  }

  if (typeof capacity !== 'number' || capacity <= 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'Capacity must be a positive number' },
    });
  }

  next();
};

module.exports = validateActivity;
