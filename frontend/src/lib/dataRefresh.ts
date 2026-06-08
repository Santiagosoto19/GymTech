type AttendanceListener = (userId: string) => void;

const listeners = new Set<AttendanceListener>();

export function notifyAttendanceChange(userId: string): void {
  listeners.forEach((cb) => cb(userId));
}

export function onAttendanceChange(cb: AttendanceListener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
