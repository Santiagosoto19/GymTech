class ActivityService {
  constructor() {
    this.activities = [
      { id: 'act-1', name: 'Yoga', instructor: 'Ana', schedule: '09:00', capacity: 20 },
      { id: 'act-2', name: 'Spinning', instructor: 'Carlos', schedule: '10:00', capacity: 15 },
    ];
  }

  async list() {
    return this.activities;
  }

  async create(data) {
    const activity = { id: `act-${Date.now()}`, ...data };
    this.activities.push(activity);
    return activity;
  }

  async getById(id) {
    const activity = this.activities.find((a) => a.id === id);
    if (!activity) {
      const err = new Error('Activity not found');
      err.status = 404;
      throw err;
    }
    return activity;
  }

  async update(id, data) {
    const index = this.activities.findIndex((a) => a.id === id);
    if (index === -1) {
      const err = new Error('Activity not found');
      err.status = 404;
      throw err;
    }
    this.activities[index] = { ...this.activities[index], ...data };
    return this.activities[index];
  }

  async remove(id) {
    const index = this.activities.findIndex((a) => a.id === id);
    if (index === -1) {
      const err = new Error('Activity not found');
      err.status = 404;
      throw err;
    }
    this.activities.splice(index, 1);
  }
}

module.exports = new ActivityService();
