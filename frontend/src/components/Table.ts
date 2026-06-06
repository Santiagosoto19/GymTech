export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => string | HTMLElement;
}

export function Table<T extends object>(
  columns: TableColumn<T>[],
  rows: T[],
  actions?: (row: T) => HTMLElement
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'overflow-x-auto rounded-xl';

  const table = document.createElement('table');
  table.className = 'data-table';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  columns.forEach((col) => {
    const th = document.createElement('th');
    th.textContent = col.label;
    headerRow.appendChild(th);
  });
  if (actions) {
    const th = document.createElement('th');
    th.textContent = 'Acciones';
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    columns.forEach((col) => {
      const td = document.createElement('td');
      if (col.render) {
        const rendered = col.render(row);
        if (typeof rendered === 'string') td.innerHTML = rendered;
        else td.appendChild(rendered);
      } else {
        td.textContent = String((row as Record<string, unknown>)[col.key as string] ?? '');
      }
      tr.appendChild(td);
    });
    if (actions) {
      const td = document.createElement('td');
      td.appendChild(actions(row));
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrapper.appendChild(table);
  return wrapper;
}
