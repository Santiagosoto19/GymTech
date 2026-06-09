import { api } from '../../lib/api';
import { Table } from '../../components/Table';
import { Layout } from '../../components/Layout';

export function AdminAudit(): HTMLElement {
  const content = document.createElement('div');
  content.innerHTML = `<div id="audit-table"></div>`;

  api.reporting.getAuditLogs().then((logs) => {
    content.querySelector('#audit-table')!.appendChild(
      Table(
        [
          { key: 'action', label: 'Acción' },
          { key: 'resource', label: 'Recurso' },
          { key: 'userId', label: 'Usuario' },
          {
            key: 'createdAt',
            label: 'Fecha',
            render: (row) => String(row.createdAt || row.timestamp || '—'),
          },
        ],
        logs
      )
    );
  }).catch(() => {
    content.innerHTML = '<p class="text-muted">No hay registros de auditoría</p>';
  });

  return Layout('Auditoría', content, 'Historial de acciones críticas');
}
