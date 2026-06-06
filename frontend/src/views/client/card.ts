import { api } from '../../lib/api';
import { getUser } from '../../state/auth';
import { ClientLayout } from '../../components/ClientLayout';
import { UserMenu } from '../../components/UserMenu';
import { ProgressRing } from '../../components/ProgressRing';

export function ClientCard(): HTMLElement {
  const user = getUser();
  const { el: progressRing, setProgress } = ProgressRing();

  const content = document.createElement('div');
  content.className = 'client-page client-page--card';

  const panel = document.createElement('div');
  panel.className = 'membership-panel';
  panel.innerHTML = `
    <div class="membership-panel__inner">
      <div class="membership-panel__header">
        <div class="membership-panel__brand">
          <div class="membership-panel__logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M6.5 6.5h11v11h-11z"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
            </svg>
          </div>
          <div>
            <div class="membership-panel__title">Mi Membresía</div>
            <div class="membership-panel__subtitle">Portal del Cliente</div>
          </div>
        </div>
        <div id="user-menu-slot"></div>
      </div>

      <div class="membership-panel__body">
        <img id="qr-img" class="membership-panel__qr" alt="Código QR de membresía" />
        <div class="membership-panel__identity">
          <h2 id="client-name">—</h2>
          <p id="client-doc">—</p>
        </div>
        <span class="pill-badge" id="plan-name">—</span>
        <div id="progress-ring-slot"></div>
        <p id="expiry-alert" class="membership-panel__alert hidden"></p>
      </div>
    </div>
  `;

  panel.querySelector('#progress-ring-slot')!.appendChild(progressRing);
  content.appendChild(panel);

  if (user) {
    panel.querySelector('#user-menu-slot')!.appendChild(
      UserMenu(user.firstName || '', user.lastName || '')
    );

    (panel.querySelector('#client-name') as HTMLElement).textContent =
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Cliente';
    (panel.querySelector('#client-doc') as HTMLElement).textContent = user.documentNumber;
    (panel.querySelector('#qr-img') as HTMLImageElement).src =
      `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(user.documentNumber)}`;

    api.membership.validateSubscription(user.id).then(async (v) => {
      const plans = await api.membership.getPlans();
      const plan = plans.find((p) => p.id === v.subscription.planId);
      (panel.querySelector('#plan-name') as HTMLElement).textContent = plan?.name || 'Membresía';

      const end = new Date(v.subscription.endDate);
      const start = new Date(v.subscription.startDate);
      const total = end.getTime() - start.getTime();
      const left = Math.max(0, end.getTime() - Date.now());
      const days = Math.ceil(left / 86400000);
      const pct = total > 0 ? Math.min(100, Math.round((left / total) * 100)) : 0;

      setProgress(pct, days);

      if (days <= 7 && days > 0) {
        const alert = panel.querySelector('#expiry-alert') as HTMLElement;
        alert.textContent = `Tu membresía vence en ${days} día${days > 1 ? 's' : ''}. Renueva pronto.`;
        alert.classList.remove('hidden');
      }
    }).catch(() => {
      (panel.querySelector('#plan-name') as HTMLElement).textContent = 'Sin membresía activa';
      setProgress(0, 0);
    });
  }

  return ClientLayout(content, { hideTopBar: true });
}
