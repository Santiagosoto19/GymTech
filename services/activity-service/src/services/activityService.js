const activityRepo = require('../infrastructure/activityRepository');

class ActivityService {
  async list() {
    return await activityRepo.findAll();
  }

  async create(data) {
    return await activityRepo.create(data);
  }

  async getById(id) {
    const activity = await activityRepo.findById(id);
    if (!activity) {
      const err = new Error('Activity not found');
      err.status = 404;
      throw err;
    }
    return activity;
  }

  async update(id, data) {
    const activity = await activityRepo.update(id, data);
    if (!activity) {
      const err = new Error('Activity not found');
      err.status = 404;
      throw err;
    }
    return activity;
  }

  async remove(id) {
    await activityRepo.delete(id);
  }

  async registerAttendance(userId, classId) {
    const currentOccupancy = await activityRepo.checkCapacity(classId);
    const activity = await activityRepo.findById(classId);

    if (!activity) {
      throw new Error('La clase no existe');
    }

    if (currentOccupancy >= activity.capacity) {
      const err = new Error('La clase está llena');
      err.status = 400;
      throw err;
    }

    return await activityRepo.registerAttendance(userId, classId);
  }
}

module.exports = new ActivityService();
