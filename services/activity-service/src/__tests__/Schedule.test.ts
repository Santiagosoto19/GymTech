import { Schedule } from '../domain/entities/Schedule';

// ─── Schedule ─────────────────────────────────────────────
describe('Schedule Entity', () => {
  const base = {
    classId: 'class-1',
    room: 'Room A',
  };

  it('should create a schedule with valid data', () => {
    const schedule = new Schedule({
      ...base,
      startTime: new Date('2026-06-10T09:00:00'),
      endTime: new Date('2026-06-10T10:00:00'),
    });

    expect(schedule.classId).toBe('class-1');
    expect(schedule.room).toBe('Room A');
  });

  it('should throw if classId is missing', () => {
    expect(() => new Schedule({
      classId: '',
      room: 'Room A',
      startTime: new Date('2026-06-10T09:00:00'),
      endTime: new Date('2026-06-10T10:00:00'),
    })).toThrow('Class ID is required');
  });

  it('should throw if room is missing', () => {
    expect(() => new Schedule({
      classId: 'class-1',
      room: '   ',
      startTime: new Date('2026-06-10T09:00:00'),
      endTime: new Date('2026-06-10T10:00:00'),
    })).toThrow('Room is required');
  });

  it('should throw if endTime is before startTime', () => {
    expect(() => new Schedule({
      ...base,
      startTime: new Date('2026-06-10T10:00:00'),
      endTime: new Date('2026-06-10T09:00:00'),
    })).toThrow('End time must be after start time');
  });

  it('should throw if endTime equals startTime', () => {
    const same = new Date('2026-06-10T09:00:00');
    expect(() => new Schedule({
      ...base,
      startTime: same,
      endTime: same,
    })).toThrow('End time must be after start time');
  });

  describe('overlaps()', () => {
    const s = (start: string, end: string) => new Schedule({
      ...base,
      startTime: new Date(`2026-06-10T${start}`),
      endTime: new Date(`2026-06-10T${end}`),
    });

    it('should detect overlap in the same room', () => {
      const a = s('09:00:00', '10:00:00');
      const b = s('09:30:00', '10:30:00');
      expect(a.overlaps(b)).toBe(true);
    });

    it('should NOT detect overlap in different rooms', () => {
      const a = new Schedule({
        classId: 'c1',
        room: 'Room A',
        startTime: new Date('2026-06-10T09:00:00'),
        endTime: new Date('2026-06-10T10:00:00'),
      });
      const b = new Schedule({
        classId: 'c2',
        room: 'Room B',
        startTime: new Date('2026-06-10T09:30:00'),
        endTime: new Date('2026-06-10T10:30:00'),
      });
      expect(a.overlaps(b)).toBe(false);
    });

    it('should NOT overlap when one ends exactly when the other starts', () => {
      const a = s('09:00:00', '10:00:00');
      const b = s('10:00:00', '11:00:00');
      expect(a.overlaps(b)).toBe(false);
    });

    it('should NOT overlap when schedules are completely separate', () => {
      const a = s('09:00:00', '10:00:00');
      const b = s('11:00:00', '12:00:00');
      expect(a.overlaps(b)).toBe(false);
    });
  });
});