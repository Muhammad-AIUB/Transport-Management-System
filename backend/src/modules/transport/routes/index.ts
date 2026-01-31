
import { Router } from 'express';
import * as feeMasterController from '../controllers/feeMaster.controller';
import * as pickupPointController from '../controllers/pickupPoint.controller';
import * as vehicleController from '../controllers/vehicle.controller';
import * as routeController from '../controllers/route.controller';
import * as routePickupPointController from '../controllers/routePickupPoint.controller';
import * as routeVehicleController from '../controllers/routeVehicle.controller';
import * as studentTransportController from '../controllers/studentTransport.controller';
const router = Router();

router.post('/fee-master', feeMasterController.createFeeMaster);
router.get('/fee-master', feeMasterController.getAllFeeMasters);
router.get('/fee-master/:id', feeMasterController.getFeeMasterById);
router.put('/fee-master/:id', feeMasterController.updateFeeMaster);
router.delete('/fee-master/:id', feeMasterController.deleteFeeMaster);

router.post('/pickup-points', pickupPointController.createPickupPoint);
router.get('/pickup-points', pickupPointController.getAllPickupPoints);
router.get('/pickup-points/:id', pickupPointController.getPickupPointById);
router.put('/pickup-points/:id', pickupPointController.updatePickupPoint);
router.delete('/pickup-points/:id', pickupPointController.deletePickupPoint);

router.post('/vehicles', vehicleController.createVehicle);
router.get('/vehicles', vehicleController.getAllVehicles);
router.get('/vehicles/:id', vehicleController.getVehicleById);
router.put('/vehicles/:id', vehicleController.updateVehicle);
router.delete('/vehicles/:id', vehicleController.deleteVehicle);

router.post('/routes', routeController.createRoute);
router.get('/routes', routeController.getAllRoutes);
router.get('/routes/:id', routeController.getRouteById);
router.put('/routes/:id', routeController.updateRoute);
router.delete('/routes/:id', routeController.deleteRoute);

router.post('/route-pickup-points', routePickupPointController.addPickupPointToRoute);
router.get('/route-pickup-points/route/:routeId', routePickupPointController.getRoutePickupPoints);
router.put('/route-pickup-points/:id', routePickupPointController.updateRoutePickupPoint);
router.delete('/route-pickup-points/:id', routePickupPointController.removePickupPointFromRoute);

router.post('/route-vehicles', routeVehicleController.assignVehicleToRoute);
router.get('/route-vehicles', routeVehicleController.getAllAssignments);
router.put('/route-vehicles/:id/deactivate', routeVehicleController.deactivateAssignment);

router.post('/student-transport/assign', studentTransportController.assignStudent);
router.get('/student-transport', studentTransportController.getAllAssignments);
router.get('/student-transport/:id', studentTransportController.getAssignmentById);
router.put('/student-transport/:id', studentTransportController.updateAssignment);
router.put('/student-transport/:id/deactivate', studentTransportController.deactivateAssignment);
router.get('/students/search', studentTransportController.searchStudents);
export default router;