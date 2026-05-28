const notificationService = require('../services/notificationService');
const { success } = require('../../../shared/helpers/responseHelper');

class NotificationController {
  async send(req, res, next) {
    try {
      const result = await notificationService.send(req.body);
      return success(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const result = await notificationService.list();
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await notificationService.getById(req.params.id);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getTemplates(req, res, next) {
    try {
      const result = await notificationService.getTemplates();
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
