const authService = require('../services/authService');
const { success, error } = require('../../../shared/helpers/responseHelper');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return success(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async me(req, res, next) {
    try {
      const result = await authService.getProfile(req.user.id);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
