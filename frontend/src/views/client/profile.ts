import { api } from '../../lib/api';
import { getUser, updateUserInSession } from '../../state/auth';
import { getClientPrefs, saveClientPrefs } from '../../lib/clientPrefs';
import { ClientLayout } from '../../components/ClientLayout';

export function ClientProfile(): HTMLElement {
  const user = getUser();
  const prefs = user ? getClientPrefs(user.id) : null;

  const content = document.createElement('div');
  content.className = 'client-page';
  content.innerHTML = `
    <form id="profile-form">
      <div class="glass-card panel-card client-form-section">
        <h3 class="gradient-text font-bold text-lg mb-1">Detalles del perfil</h3>
        <p class="text-xs text-muted mb-6">Información personal y de contacto</p>

        <div class="client-form-grid">
          <div class="client-form-field">
            <label for="firstName">Nombre</label>
            <input id="firstName" class="input-field" name="firstName" placeholder="Nombre" />
          </div>
          <div class="client-form-field">
            <label for="lastName">Apellido</label>
            <input id="lastName" class="input-field" name="lastName" placeholder="Apellido" />
          </div>
          <div class="client-form-field">
            <label for="email">Correo electrónico</label>
            <input id="email" class="input-field" type="email" disabled />
          </div>
          <div class="client-form-field">
            <label for="documentNumber">Documento</label>
            <input id="documentNumber" class="input-field" disabled />
          </div>
          <div class="client-form-field">
            <label for="phone">Teléfono</label>
            <input id="phone" class="input-field" name="phone" placeholder="+57 300 000 0000" />
          </div>
          <div class="client-form-field">
            <label for="emergencyContact">Contacto de emergencia</label>
            <input id="emergencyContact" class="input-field" name="emergencyContact" placeholder="Nombre y teléfono" />
          </div>
        </div>

        <div class="client-form-actions mt-6">
          <p id="profile-msg" class="text-sm hidden"></p>
          <button type="submit" class="btn-primary">Guardar cambios</button>
        </div>
      </div>
    </form>
  `;

  if (user && prefs) {
    (content.querySelector('#firstName') as HTMLInputElement).value = user.firstName || '';
    (content.querySelector('#lastName') as HTMLInputElement).value = user.lastName || '';
    (content.querySelector('#email') as HTMLInputElement).value = user.email || '';
    (content.querySelector('#documentNumber') as HTMLInputElement).value = user.documentNumber || '';
    (content.querySelector('#phone') as HTMLInputElement).value = prefs.phone;
    (content.querySelector('#emergencyContact') as HTMLInputElement).value = prefs.emergencyContact;
  }

  content.querySelector('#profile-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!user) return;

    const msg = content.querySelector('#profile-msg') as HTMLElement;
    const fd = new FormData(e.target as HTMLFormElement);

    try {
      const updated = await api.auth.updateMe({
        firstName: String(fd.get('firstName') || ''),
        lastName: String(fd.get('lastName') || ''),
      });
      updateUserInSession(updated);

      saveClientPrefs(user.id, {
        phone: String(fd.get('phone') || ''),
        emergencyContact: String(fd.get('emergencyContact') || ''),
      });

      msg.textContent = 'Perfil actualizado correctamente';
      msg.className = 'text-sm text-success';
      msg.classList.remove('hidden');
    } catch (err) {
      msg.textContent = (err as { message?: string }).message || 'Error al guardar';
      msg.className = 'text-sm text-danger';
      msg.classList.remove('hidden');
    }
  });

  return ClientLayout(content, {
    pageTitle: 'Perfil',
    pageSubtitle: 'Tu información personal',
  });
}
