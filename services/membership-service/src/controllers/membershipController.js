const membershipService = require('../services/membershipService');
const { success } = require('../../../shared/helpers/responseHelper');

class MembershipController {
  async list(req, res, next) {
    try {
      const result = await membershipService.list();
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const result = await membershipService.create(req.body);
      return success(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await membershipService.getById(req.params.id);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const result = await membershipService.update(req.params.id, req.body);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      await membershipService.remove(req.params.id);
      return success(res, { message: 'Membership deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MembershipController();
