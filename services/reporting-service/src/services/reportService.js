const reportingRepo = require('../infrastructure/reportingRepository');

class ReportService {
  async list() {
    return await reportingRepo.findAllReports();
  }

  async create(data) {
    return await reportingRepo.createReport(data);
  }

  async getById(id) {
    const report = await reportingRepo.findReportById(id);
    if (!report) {
      const err = new Error('Report not found');
      err.status = 404;
      throw err;
    }
    return report;
  }

  async getDashboard() {
    const stats = await reportingRepo.getDashboardStats();
    return {
      totalUsers: stats.total_users || 0,
      activeMemberships: stats.active_memberships || 0,
      todayAttendance: stats.today_attendance || 0,
      revenueThisMonth: 3499.50, // This would be another SQL sum query
    };
  }
}

module.exports = new ReportService();
