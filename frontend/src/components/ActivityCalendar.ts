export type CalendarFilter = 'all' | 'classes' | 'events' | 'mine';

export interface CalendarEvent {
  id: string;
  classId: string;
  title: string;
  startTime: string;
  endTime: string;
  room: string;
  instructor?: string;
  capacity?: number;
  enrolledCount?: number;
  kind: 'class' | 'event';
  isMine?: boolean;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const EVENT_COLORS = [
  '#ff3366', '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6',
];

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function getCalendarDays(year: number, month: number): Array<Date | null> {
  const first = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const startPad = (first.getDay() + 6) % 7;
  const days: Array<Date | null> = Array(startPad).fill(null);
  for (let d = 1; d <= lastDay; d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function colorForClass(classId: string): string {
  let hash = 0;
  for (let i = 0; i < classId.length; i++) hash = classId.charCodeAt(i) + ((hash << 5) - hash);
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length];
}

export function ActivityCalendar(): {
  el: HTMLElement;
  setEvents: (events: CalendarEvent[]) => void;
  setFilter: (filter: CalendarFilter) => void;
  onSelectDay: (cb: (date: Date, events: CalendarEvent[]) => void) => void;
} {
  let events: CalendarEvent[] = [];
  let filter: CalendarFilter = 'all';
  let viewYear = new Date().getFullYear();
  let viewMonth = new Date().getMonth();
  let selectedDate: Date | null = new Date();
  let onDaySelect: ((date: Date, dayEvents: CalendarEvent[]) => void) | null = null;

  const el = document.createElement('div');
  el.className = 'activity-calendar';

  function filteredEvents(): CalendarEvent[] {
    return events.filter((e) => {
      if (filter === 'classes') return e.kind === 'class';
      if (filter === 'events') return e.kind === 'event';
      if (filter === 'mine') return e.isMine;
      return true;
    });
  }

  function eventsForDay(day: Date): CalendarEvent[] {
    return filteredEvents().filter((e) => sameDay(new Date(e.startTime), day));
  }

  el.innerHTML = `
    <div class="activity-calendar__header">
      <button type="button" class="activity-calendar__nav" id="cal-prev" aria-label="Mes anterior">‹</button>
      <h3 class="activity-calendar__month" id="cal-month-label"></h3>
      <button type="button" class="activity-calendar__nav" id="cal-next" aria-label="Mes siguiente">›</button>
    </div>
    <div class="activity-calendar__weekdays">
      ${WEEKDAYS.map((d) => `<span>${d}</span>`).join('')}
    </div>
    <div class="activity-calendar__grid" id="cal-grid"></div>
    <div class="activity-calendar__legend">
      <span><i style="background:#ff3366"></i> Clases</span>
      <span><i style="background:#6366f1"></i> Eventos</span>
      <span><i style="background:#10b981"></i> Mis reservas</span>
    </div>
    <div class="activity-calendar__day-detail" id="cal-day-detail"></div>
  `;

  el.querySelector('#cal-prev')!.addEventListener('click', () => {
    if (viewMonth === 0) { viewMonth = 11; viewYear--; } else viewMonth--;
    render();
  });
  el.querySelector('#cal-next')!.addEventListener('click', () => {
    if (viewMonth === 11) { viewMonth = 0; viewYear++; } else viewMonth++;
    render();
  });

  function render(): void {
    const today = new Date();
    const days = getCalendarDays(viewYear, viewMonth);

    (el.querySelector('#cal-month-label') as HTMLElement).textContent = `${MONTHS[viewMonth]} ${viewYear}`;

    const grid = el.querySelector('#cal-grid')!;
    grid.innerHTML = '';
    days.forEach((day) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'activity-calendar__day';
      if (!day) {
        cell.classList.add('activity-calendar__day--empty');
        cell.disabled = true;
        grid.appendChild(cell);
        return;
      }

      const dayEvents = eventsForDay(day);
      const isToday = sameDay(day, today);
      const isSelected = selectedDate && sameDay(day, selectedDate);
      if (isToday) cell.classList.add('activity-calendar__day--today');
      if (isSelected) cell.classList.add('activity-calendar__day--selected');

      cell.innerHTML = `
        <span class="activity-calendar__day-num">${day.getDate()}</span>
        <div class="activity-calendar__dots">
          ${dayEvents.slice(0, 3).map((e) =>
            `<span class="activity-calendar__dot${e.isMine ? ' activity-calendar__dot--mine' : ''}" style="background:${colorForClass(e.classId)}"></span>`
          ).join('')}
        </div>
      `;

      cell.addEventListener('click', () => {
        selectedDate = day;
        render();
        onDaySelect?.(day, dayEvents);
      });
      grid.appendChild(cell);
    });

    const detail = el.querySelector('#cal-day-detail')!;
    if (selectedDate) {
      const dayEvents = eventsForDay(selectedDate);
      if (!dayEvents.length) {
        detail.innerHTML = `<p class="text-muted text-sm">Sin actividades para el ${selectedDate.getDate()} de ${MONTHS[selectedDate.getMonth()]}</p>`;
      } else {
        detail.innerHTML = dayEvents.map((e) => `
          <div class="activity-calendar__event" data-id="${e.id}">
            <span class="activity-calendar__event-bar" style="background:${colorForClass(e.classId)}"></span>
            <div>
              <strong>${e.title}</strong>
              <p class="text-xs text-muted">${new Date(e.startTime).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })} · ${e.room}${e.instructor ? ` · ${e.instructor}` : ''}</p>
            </div>
          </div>
        `).join('');
      }
    }
  }

  render();

  return {
    el,
    setEvents(newEvents) {
      events = newEvents;
      render();
    },
    setFilter(newFilter) {
      filter = newFilter;
      render();
    },
    onSelectDay(cb) {
      onDaySelect = cb;
    },
  };
}

export function isEventRoom(room: string): boolean {
  const r = room.toLowerCase();
  return r.includes('event') || r.includes('auditorio') || r.includes('pista') || r.includes('taller');
}

export function buildCalendarEvents(
  schedules: Array<{ id: string; classId: string; startTime: string; endTime: string; room: string }>,
  classes: Array<{ id: string; name: string; instructor?: string; capacity?: number; enrolledCount?: number }>,
  reservedClassIds: Set<string>
): CalendarEvent[] {
  const classMap = new Map(classes.map((c) => [c.id, c]));
  return schedules.map((s) => {
    const cls = classMap.get(s.classId);
    return {
      id: s.id,
      classId: s.classId,
      title: cls?.name || 'Clase',
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room,
      instructor: cls?.instructor,
      capacity: cls?.capacity,
      enrolledCount: cls?.enrolledCount,
      kind: isEventRoom(s.room) ? 'event' as const : 'class' as const,
      isMine: reservedClassIds.has(s.classId),
    };
  });
}
