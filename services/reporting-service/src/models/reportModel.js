// Modelo de reporte para Reporting Service
// En un caso real, aquí se usaría Sequelize, Mongoose, Prisma, etc.

class ReportModel {
  constructor(data) {
    this.id = data.id;
    this.type = data.type;
    this.title = data.title;
    this.description = data.description;
    this.data = data.data || {};
    this.generatedAt = data.generatedAt || new Date();
    this.createdAt = data.createdAt || new Date();
  }

  static mockReports = [];

  static async create(data) {
    const report = new ReportModel({
      id: `rep-${Date.now()}`,
      ...data,
    });
    ReportModel.mockReports.push(report);
    return report;
  }

  static async findAll() {
    return ReportModel.mockReports;
  }

  static async findById(id) {
    return ReportModel.mockReports.find((r) => r.id === id);
  }
}

module.exports = ReportModel;
