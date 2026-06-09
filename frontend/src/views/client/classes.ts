import { api } from '../../lib/api';
import { getUser } from '../../state/auth';
import { ClientLayout } from '../../components/ClientLayout';
import {
  ActivityCalendar,
  buildCalendarEvents,
  type CalendarEvent,
  type CalendarFilter,
} from '../../components/ActivityCalendar';

type FilterKey = CalendarFilter;

export function ClientClasses(): HTMLElement {
  const user = getUser();
  let activeFilter: FilterKey = 'all';

  const content = document.createElement('div');
  content.className = 'activities-page';

  const calendar = ActivityCalendar();

  content.innerHTML = `
    <div class="activities-page__header">
      <div>
        <h2 class="activities-page__title">Mi Calendario</h2>
        <p class="activities-page__subtitle">Actividades y reservas del gimnasio</p>
      </div>
      <div class="activities-filters" id="activity-filters">
        <button type="button" class="pill-filter pill-filter--active" data-filter="all">Todas</button>
        <button type="button" class="pill-filter" data-filter="classes">Clases</button>
        <button type="button" class="pill-filter" data-filter="events">Eventos</button>
        <button type="button" class="pill-filter" data-filter="mine">Mis Reservas</button>
      </div>
    </div>
    <div class="activities-layout">
      <div class="activities-layout__calendar" id="calendar-slot"></div>
      <aside class="activities-sidebar glass-card">
        <h3 class="activities-sidebar__title gradient-text">Próximas reservas</h3>
        <div id="upcoming-list" class="activities-sidebar__list">
          <p class="text-muted text-sm">Cargando...</p>
        </div>
        <h3 class="activities-sidebar__title gradient-text mt-6">Disponibles para reservar</h3>
        <div id="available-list" class="activities-sidebar__list"></div>
      </aside>
    </div>
    <p id="activity-msg" class="text-sm text-center mt-4 hidden"></p>
  `;

  content.querySelector('#calendar-slot')!.appendChild(calendar.el);

  const upcomingList = content.querySelector('#upcoming-list')!;
  const availableList = content.querySelector('#available-list')!;
  const msgEl = content.querySelector('#activity-msg') as HTMLElement;

  function showMsg(text: string, type: 'success' | 'danger'): void {
    msgEl.textContent = text;
    msgEl.className = `text-sm text-center mt-4 font-semibold text-${type}`;
    msgEl.classList.remove('hidden');
    setTimeout(() => msgEl.classList.add('hidden'), 4000);
  }

  function renderUpcoming(events: CalendarEvent[], reservedIds: Set<string>): void {
    const now = Date.now();
    const upcoming = events
      .filter((e) => reservedIds.has(e.classId) && new Date(e.startTime).getTime() >= now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 6);

    if (!upcoming.length) {
      upcomingList.innerHTML = '<p class="text-muted text-sm">No tienes reservas próximas</p>';
      return;
    }

    upcomingList.innerHTML = '';
    upcoming.forEach((e) => {
      const item = document.createElement('div');
      item.className = 'activities-sidebar__item';
      const start = new Date(e.startTime);
      item.innerHTML = `
        <div class="activities-sidebar__date">
          <span class="activities-sidebar__day">${start.getDate()}</span>
          <span class="activities-sidebar__month">${start.toLocaleString('es', { month: 'short' })}</span>
        </div>
        <div class="activities-sidebar__info">
          <strong>${e.title}</strong>
          <p class="text-xs text-muted">${start.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })} · ${e.room}</p>
        </div>
      `;
      upcomingList.appendChild(item);
    });
  }

  function renderAvailable(
    classes: Awaited<ReturnType<typeof api.activity.getClasses>>,
    reservedIds: Set<string>
  ): void {
    const available = classes.filter((c) => !reservedIds.has(c.id));
    if (!available.length) {
      availableList.innerHTML = '<p class="text-muted text-sm">Ya reservaste todas las clases disponibles</p>';
      return;
    }

    availableList.innerHTML = '';
    available.forEach((c) => {
      const enrolled = c.enrolledCount ?? 0;
      const full = enrolled >= c.capacity;
      const item = document.createElement('div');
      item.className = 'activities-sidebar__item activities-sidebar__item--action';
      item.innerHTML = `
        <div class="activities-sidebar__info flex-1">
          <strong>${c.name}</strong>
          <p class="text-xs text-muted">${c.instructor || ''} · ${enrolled}/${c.capacity} cupos</p>
        </div>
        <button type="button" class="btn-primary text-xs px-3 py-1.5 reserve-btn" ${full ? 'disabled' : ''}>
          ${full ? 'Llena' : 'Reservar'}
        </button>
      `;
      if (!full && user) {
        item.querySelector('.reserve-btn')!.addEventListener('click', async () => {
          try {
            await api.activity.reserveClass(c.id, user.id);
            showMsg('Cupo reservado exitosamente', 'success');
            loadData();
          } catch (err) {
            showMsg((err as { message?: string }).message || 'Error al reservar', 'danger');
          }
        });
      }
      availableList.appendChild(item);
    });
  }

  async function loadData(): Promise<void> {
    try {
      const [classes, schedules, reservations] = await Promise.all([
        api.activity.getClasses(),
        api.activity.getSchedules(),
        api.activity.getMyReservations(),
      ]);

      const reservedIds = new Set(reservations.map((r) => r.classId));
      const events = buildCalendarEvents(schedules, classes, reservedIds);

      calendar.setEvents(events);
      calendar.setFilter(activeFilter);
      renderUpcoming(events, reservedIds);
      renderAvailable(classes, reservedIds);
    } catch {
      upcomingList.innerHTML = '<p class="text-muted text-sm">No se pudieron cargar las actividades</p>';
      availableList.innerHTML = '';
    }
  }

  content.querySelectorAll('.pill-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = (btn as HTMLElement).dataset.filter as FilterKey;
      content.querySelectorAll('.pill-filter').forEach((b) => b.classList.remove('pill-filter--active'));
      btn.classList.add('pill-filter--active');
      calendar.setFilter(activeFilter);
    });
  });

  loadData();

  return ClientLayout(content, {
    pageTitle: 'Actividades',
    pageSubtitle: 'Mi calendario y reservas',
  });
}
