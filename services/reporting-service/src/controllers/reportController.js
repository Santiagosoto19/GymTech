const reportService = require('../services/reportService');
const { success } = require('../../../shared/helpers/responseHelper');

class ReportController {
  async list(req, res, next) {
    try {
      const result = await reportService.list();
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const result = await reportService.create(req.body);
      return success(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await reportService.getById(req.params.id);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const result = await reportService.getDashboard();
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportController();
