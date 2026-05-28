class ReportService {
  constructor() {
    this.reports = [
      { id: 'rep-1', type: 'attendance', title: 'Monthly Attendance', generatedAt: new Date() },
      { id: 'rep-2', type: 'revenue', title: 'Quarterly Revenue', generatedAt: new Date() },
    ];
  }

  async list() {
    return this.reports;
  }

  async create(data) {
    const report = { id: `rep-${Date.now()}`, generatedAt: new Date(), ...data };
    this.reports.push(report);
    return report;
  }

  async getById(id) {
    const report = this.reports.find((r) => r.id === id);
    if (!report) {
      const err = new Error('Report not found');
      err.status = 404;
      throw err;
    }
    return report;
  }

  async getDashboard() {
    return {
      totalUsers: 150,
      activeMemberships: 120,
      todayAttendance: 45,
      revenueThisMonth: 3499.50,
    };
  }
}

module.exports = new ReportService();
