import { api } from '../../lib/api';
import { setSession, getDefaultRoute } from '../../state/auth';
import { NetworkBadge } from '../../components/NetworkBadge';

export function LoginView(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-dvh flex items-center justify-center p-4 relative';

  const networkPos = document.createElement('div');
  networkPos.className = 'absolute top-4 right-4';
  networkPos.appendChild(NetworkBadge());
  container.appendChild(networkPos);

  const card = document.createElement('div');
  card.className = 'glass-card w-full max-w-md p-8 animate-slide-up';

  card.innerHTML = `
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style="background: linear-gradient(135deg, #ff3366, #6366f1);">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M6.5 6.5h11v11h-11z"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
        </svg>
      </div>
      <h1 class="text-3xl font-extrabold tracking-tight" style="background: linear-gradient(135deg, #ff3366, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">GymTech</h1>
      <p class="text-muted text-sm mt-2 font-medium">Sistema de gestión de gimnasios</p>
    </div>

    <form id="login-form" class="space-y-5" novalidate>
      <div>
        <label for="email" class="block text-sm font-semibold text-secondary mb-1.5">Correo electrónico</label>
        <input id="email" type="email" class="input-field" placeholder="usuario@gymtech.com" autocomplete="email" required />
        <p id="email-error" class="text-danger text-xs mt-1 hidden font-medium"></p>
      </div>
      <div>
        <label for="password" class="block text-sm font-semibold text-secondary mb-1.5">Contraseña</label>
        <input id="password" type="password" class="input-field" placeholder="••••••••" autocomplete="current-password" required />
        <p id="password-error" class="text-danger text-xs mt-1 hidden font-medium"></p>
      </div>
      <p id="form-error" class="text-danger text-sm text-center hidden font-medium"></p>
      <button type="submit" id="submit-btn" class="btn-primary w-full py-3.5 text-base">
        Iniciar sesión
      </button>
    </form>
  `;

  container.appendChild(card);

  const form = card.querySelector('#login-form') as HTMLFormElement;
  const emailInput = card.querySelector('#email') as HTMLInputElement;
  const passwordInput = card.querySelector('#password') as HTMLInputElement;
  const emailError = card.querySelector('#email-error') as HTMLElement;
  const passwordError = card.querySelector('#password-error') as HTMLElement;
  const formError = card.querySelector('#form-error') as HTMLElement;
  const submitBtn = card.querySelector('#submit-btn') as HTMLButtonElement;

  function validateField(input: HTMLInputElement, errorEl: HTMLElement, message: string): boolean {
    if (!input.value.trim()) {
      input.classList.add('error');
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
      return false;
    }
    input.classList.remove('error');
    errorEl.classList.add('hidden');
    return true;
  }

  emailInput.addEventListener('input', () => validateField(emailInput, emailError, ''));
  passwordInput.addEventListener('input', () => validateField(passwordInput, passwordError, ''));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.classList.add('hidden');

    const emailValid = validateField(emailInput, emailError, 'El correo es obligatorio');
    const passValid = validateField(passwordInput, passwordError, 'La contraseña es obligatoria');
    if (!emailValid || !passValid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Ingresando...';

    try {
      const { token, user } = await api.auth.login(emailInput.value.trim(), passwordInput.value);
      setSession(token, user);
      window.location.hash = getDefaultRoute(user.role);
    } catch (err) {
      const msg = (err as { message?: string }).message || 'Error al iniciar sesión';
      formError.textContent = msg;
      formError.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Iniciar sesión';
    }
  });

  return container;
}
