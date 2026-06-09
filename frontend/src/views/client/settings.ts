import { api } from '../../lib/api';
import { getUser } from '../../state/auth';
import { getClientPrefs, saveClientPrefs } from '../../lib/clientPrefs';
import { ClientLayout } from '../../components/ClientLayout';

export function ClientSettings(): HTMLElement {
  const user = getUser();
  const prefs = user ? getClientPrefs(user.id) : null;

  const content = document.createElement('div');
  content.className = 'client-page';
  content.innerHTML = `
    <form id="settings-form">
      <div class="client-settings-grid">
        <div class="glass-card panel-card">
          <h3 class="gradient-text font-bold text-lg mb-1">Seguridad</h3>
          <p class="text-xs text-muted mb-5">Actualiza tu contraseña de acceso</p>

          <div class="client-form-field">
            <label for="newPassword">Nueva contraseña</label>
            <input id="newPassword" class="input-field" name="newPassword" type="password" placeholder="Mínimo 6 caracteres" autocomplete="new-password" />
          </div>
          <div class="client-form-field">
            <label for="confirmPassword">Confirmar contraseña</label>
            <input id="confirmPassword" class="input-field" name="confirmPassword" type="password" placeholder="Repite la contraseña" autocomplete="new-password" />
          </div>
        </div>

        <div class="glass-card panel-card">
          <h3 class="gradient-text font-bold text-lg mb-1">Preferencias</h3>
          <p class="text-xs text-muted mb-5">Controla tus notificaciones</p>

          <label class="client-toggle">
            <input type="checkbox" name="emailAlerts" ${prefs?.emailAlerts ? 'checked' : ''} />
            <span class="client-toggle__track"></span>
            <span class="client-toggle__label">Alertas por correo</span>
          </label>
          <label class="client-toggle">
            <input type="checkbox" name="classReminders" ${prefs?.classReminders ? 'checked' : ''} />
            <span class="client-toggle__track"></span>
            <span class="client-toggle__label">Recordatorios de clases</span>
          </label>
          <label class="client-toggle">
            <input type="checkbox" name="membershipAlerts" ${prefs?.membershipAlerts ? 'checked' : ''} />
            <span class="client-toggle__track"></span>
            <span class="client-toggle__label">Avisos de membresía</span>
          </label>
        </div>
      </div>

      <div class="glass-card panel-card mt-4">
        <h3 class="gradient-text font-bold text-lg mb-4">Notificaciones recientes</h3>
        <div id="notif-list" class="client-notif-list"></div>
      </div>

      <div class="client-form-actions mt-4">
        <p id="settings-msg" class="text-sm hidden"></p>
        <button type="submit" class="btn-primary">Guardar cambios</button>
      </div>
    </form>
  `;

  if (user) {
    api.notification.getByUser(user.id).then((notifs) => {
      const list = content.querySelector('#notif-list')!;
      if (!notifs.length) {
        list.innerHTML = '<p class="text-muted text-sm">No tienes alertas pendientes</p>';
        return;
      }
      list.innerHTML = notifs.map((n) => `
        <div class="client-notif-item">
          <div class="client-notif-item__dot client-notif-item__dot--${n.status === 'read' ? 'read' : 'pending'}"></div>
          <div>
            <p class="text-sm font-medium">${n.message}</p>
            <span class="text-xs text-muted">${n.type} · ${n.status}</span>
          </div>
        </div>
      `).join('');
    }).catch(() => {
      content.querySelector('#notif-list')!.innerHTML = '<p class="text-muted text-sm">Sin notificaciones</p>';
    });
  }

  content.querySelector('#settings-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!user) return;

    const msg = content.querySelector('#settings-msg') as HTMLElement;
    const fd = new FormData(e.target as HTMLFormElement);
    const newPass = String(fd.get('newPassword') || '');
    const confirm = String(fd.get('confirmPassword') || '');

    if (newPass && newPass.length < 6) {
      msg.textContent = 'La contraseña debe tener al menos 6 caracteres';
      msg.className = 'text-sm text-danger';
      msg.classList.remove('hidden');
      return;
    }
    if (newPass && newPass !== confirm) {
      msg.textContent = 'Las contraseñas no coinciden';
      msg.className = 'text-sm text-danger';
      msg.classList.remove('hidden');
      return;
    }

    try {
      if (newPass) {
        await api.auth.updateMe({ password: newPass });
      }
      saveClientPrefs(user.id, {
        emailAlerts: fd.get('emailAlerts') === 'on',
        classReminders: fd.get('classReminders') === 'on',
        membershipAlerts: fd.get('membershipAlerts') === 'on',
      });
      msg.textContent = 'Ajustes guardados correctamente';
      msg.className = 'text-sm text-success';
      msg.classList.remove('hidden');
      (content.querySelector('#newPassword') as HTMLInputElement).value = '';
      (content.querySelector('#confirmPassword') as HTMLInputElement).value = '';
    } catch (err) {
      msg.textContent = (err as { message?: string }).message || 'Error al guardar';
      msg.className = 'text-sm text-danger';
      msg.classList.remove('hidden');
    }
  });

  return ClientLayout(content, {
    pageTitle: 'Ajustes',
    pageSubtitle: 'Seguridad y preferencias',
  });
}
