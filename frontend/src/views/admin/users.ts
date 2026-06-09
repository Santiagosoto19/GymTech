import { api } from '../../lib/api';
import { Table } from '../../components/Table';
import { Layout } from '../../components/Layout';

export function AdminUsers(): HTMLElement {
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="glass-card panel-card mb-6">
      <h2 class="font-semibold mb-4">Crear usuario</h2>
      <form id="create-user" class="grid md:grid-cols-2 gap-3">
        <input class="input-field" name="email" placeholder="Email" required />
        <input class="input-field" name="password" type="password" placeholder="Contraseña" required />
        <input class="input-field" name="documentNumber" placeholder="Documento" required />
        <input class="input-field" name="firstName" placeholder="Nombre" />
        <input class="input-field" name="lastName" placeholder="Apellido" />
        <select class="input-field" name="role">
          <option value="client">Cliente</option>
          <option value="receptionist">Recepcionista</option>
          <option value="trainer">Entrenador</option>
          <option value="admin">Administrador</option>
        </select>
        <button type="submit" class="btn-primary md:col-span-2">Crear usuario</button>
      </form>
      <p id="create-msg" class="text-sm mt-2 hidden"></p>
    </div>
    <div id="users-table"></div>
  `;

  const tableContainer = content.querySelector('#users-table')!;

  function loadUsers(): void {
    api.auth.getUsers().then(({ users }) => {
      tableContainer.innerHTML = '';
      tableContainer.appendChild(
        Table(
          [
            { key: 'email', label: 'Email' },
            { key: 'documentNumber', label: 'Documento' },
            { key: 'role', label: 'Rol' },
            {
              key: 'status',
              label: 'Estado',
              render: (row) => {
                const s = String(row.status);
                return `<span class="status-badge ${s === 'active' ? 'active' : 'inactive'}">${s}</span>`;
              },
            },
          ],
          users,
          (row) => {
            const actions = document.createElement('div');
            actions.className = 'flex gap-2';
            const toggle = document.createElement('button');
            toggle.className = 'text-xs px-3 py-1.5 rounded-lg font-semibold text-accent border border-slate-200 bg-white hover:bg-pink-50 transition-colors';
            const status = String(row.status);
            toggle.textContent = status === 'active' ? 'Suspender' : 'Activar';
            toggle.onclick = async () => {
              await api.auth.updateStatus(String(row.id), status === 'active' ? 'inactive' : 'active');
              loadUsers();
            };
            actions.appendChild(toggle);
            return actions;
          }
        )
      );
    });
  }

  loadUsers();

  content.querySelector('#create-user')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const msg = content.querySelector('#create-msg') as HTMLElement;
    try {
      await api.auth.createUser(Object.fromEntries(fd.entries()));
      msg.textContent = 'Usuario creado';
      msg.className = 'text-sm mt-2 text-success';
      msg.classList.remove('hidden');
      form.reset();
      loadUsers();
    } catch (err) {
      msg.textContent = (err as ApiError).message || 'Error';
      msg.className = 'text-sm mt-2 text-danger';
      msg.classList.remove('hidden');
    }
  });

  return Layout('Usuarios y Roles', content);
}

interface ApiError { message: string }
