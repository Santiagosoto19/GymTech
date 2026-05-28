const activityService = require('../services/activityService');
const { success } = require('../../../shared/helpers/responseHelper');

class ActivityController {
  async list(req, res, next) {
    try {
      const result = await activityService.list();
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const result = await activityService.create(req.body);
      return success(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await activityService.getById(req.params.id);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const result = await activityService.update(req.params.id, req.body);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      await activityService.remove(req.params.id);
      return success(res, { message: 'Activity deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ActivityController();
