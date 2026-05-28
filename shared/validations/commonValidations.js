const Joi = require('joi');

const idSchema = Joi.string().uuid().required();

const emailSchema = Joi.string().email().required();

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const validate = (schema) => {
  return (req, res, next) => {
    const data = req.method === 'GET' ? req.query : req.body;
    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.details.map((d) => d.message),
        },
      });
    }

    if (req.method === 'GET') {
      req.query = value;
    } else {
      req.body = value;
    }
    next();
  };
};

module.exports = {
  idSchema,
  emailSchema,
  paginationSchema,
  validate,
};
