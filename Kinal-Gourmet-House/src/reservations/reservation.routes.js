import { Router } from "express";
import { createReservation, getReservations, getReservationById, updateReservation, deleteReservation } from "./reservation.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

// 🔒 Todas las rutas requieren autenticación
router.use(verifyToken);

// Crear reservación (todos los autenticados)
router.post('/create', createReservation);

// Ver reservaciones (clientes: las suyas; admins: todas - lógica en controller)
router.get('/', getReservations);
router.get('/:id', getReservationById);

// Actualizar reservación (clientes: la suya; admins: cualquiera)
router.put('/:id', updateReservation);

// Eliminar (admins y el propio cliente)
router.delete('/:id', deleteReservation);

export default router;
