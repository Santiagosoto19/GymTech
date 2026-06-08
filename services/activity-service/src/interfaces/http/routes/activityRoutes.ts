import { Router } from 'express';
import { ActivityController } from '../controllers/activityController';
import { requireRoles } from '../middlewares/requireRoles';

export function createActivityRoutes(controller: ActivityController): Router {
  const router = Router();
  const trainer = requireRoles('trainer', 'admin');
  const client = requireRoles('client', 'admin');

  router.get('/classes', controller.listClasses);
  router.post('/classes', trainer, controller.createClass);
  router.post('/classes/:id/reservations', client, controller.reserveClass);
  router.get('/reservations/mine', client, controller.listMyReservations);

  router.get('/routines', controller.listRoutines);
  router.get('/routines/mine', controller.getMyRoutine);
  router.get('/routines/assigned/:userId', trainer, controller.getMyRoutine);
  router.post('/routines', trainer, controller.createRoutine);
  router.post('/routines/assign', trainer, controller.assignRoutine);

  router.get('/schedules', controller.listSchedules);
  router.post('/schedules', trainer, controller.createSchedule);

  router.get('/clients/assigned', trainer, controller.listAssignedClients);
  router.post('/clients/assign', trainer, controller.assignClient);

  router.post('/attendance', trainer, controller.recordAttendance);

  return router;
}
