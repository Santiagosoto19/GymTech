import { api, downloadBase64Report } from '../../lib/api';
import { Layout } from '../../components/Layout';

export function AdminReports(): HTMLElement {
  const content = document.createElement('div');
  content.className = 'max-w-2xl';
  content.innerHTML = `
    <div class="glass-card panel-card space-y-5">
      <h2 class="font-semibold">Generar reportes</h2>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="text-sm text-secondary">Desde</label><input id="from-date" type="date" class="input-field mt-1" /></div>
        <div><label class="text-sm text-secondary">Hasta</label><input id="to-date" type="date" class="input-field mt-1" /></div>
      </div>
      <p id="filter-error" class="text-danger text-sm hidden">Debe seleccionar ambas fechas</p>
      <div class="grid grid-cols-2 gap-3">
        <button id="btn-revenue-pdf" class="btn-primary">Ingresos PDF</button>
        <button id="btn-revenue-xls" class="btn-primary">Ingresos Excel</button>
        <button id="btn-att-pdf" class="btn-primary">Asistencia PDF</button>
        <button id="btn-att-xls" class="btn-primary">Asistencia Excel</button>
      </div>
      <p id="report-msg" class="text-sm text-center hidden"></p>
    </div>
  `;

  const fromDate = content.querySelector('#from-date') as HTMLInputElement;
  const toDate = content.querySelector('#to-date') as HTMLInputElement;
  const filterError = content.querySelector('#filter-error') as HTMLElement;
  const reportMsg = content.querySelector('#report-msg') as HTMLElement;

  async function generate(type: 'revenue' | 'attendance', format: 'pdf' | 'excel'): Promise<void> {
    filterError.classList.add('hidden');
    reportMsg.classList.add('hidden');
    if (!fromDate.value || !toDate.value) {
      filterError.classList.remove('hidden');
      return;
    }
    try {
      const fn = type === 'revenue' ? api.reporting.generateRevenue : api.reporting.generateAttendance;
      const report = await fn(fromDate.value, toDate.value, format);
      if (report.contentBase64) {
        const mime = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        downloadBase64Report(report.contentBase64, `${type}-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`, mime);
      } else if (report.id) {
        const blob = await api.reporting.downloadReport(report.id);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        a.click();
      }
      reportMsg.textContent = 'Reporte generado y descargado';
      reportMsg.className = 'text-sm text-center text-success';
      reportMsg.classList.remove('hidden');
    } catch (err) {
      reportMsg.textContent = (err as { message?: string }).message || 'Error';
      reportMsg.className = 'text-sm text-center text-danger';
      reportMsg.classList.remove('hidden');
    }
  }

  content.querySelector('#btn-revenue-pdf')!.addEventListener('click', () => generate('revenue', 'pdf'));
  content.querySelector('#btn-revenue-xls')!.addEventListener('click', () => generate('revenue', 'excel'));
  content.querySelector('#btn-att-pdf')!.addEventListener('click', () => generate('attendance', 'pdf'));
  content.querySelector('#btn-att-xls')!.addEventListener('click', () => generate('attendance', 'excel'));

  return Layout('Reportes', content);
}
