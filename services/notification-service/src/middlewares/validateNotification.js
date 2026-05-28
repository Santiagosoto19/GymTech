const validateNotification = (req, res, next) => {
  const { recipient, channel, subject, body } = req.body;

  if (!recipient || !channel || !subject || !body) {
    return res.status(400).json({
      success: false,
      error: { message: 'Recipient, channel, subject and body are required' },
    });
  }

  const validChannels = ['email', 'sms', 'push'];
  if (!validChannels.includes(channel)) {
    return res.status(400).json({
      success: false,
      error: { message: `Channel must be one of: ${validChannels.join(', ')}` },
    });
  }

  next();
};

module.exports = validateNotification;
