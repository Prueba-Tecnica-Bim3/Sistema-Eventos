const express = require('express');
const validateJWT = require('../../middlewares/validate-JWT');
const checkValidators = require('../../middlewares/checkValidators');
const occupancyController = require('./occupancy.controller');
const {
  availableEventsValidator,
  fullEventsValidator,
  summaryValidator,
} = require('./occupancy.validators');

const router = express.Router();

/**
 * @openapi
 * /events/available:
 *   get:
 *     summary: Listar eventos con cupos disponibles
 *     tags: [Occupancy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos con cupos disponibles
 *       401:
 *         description: Token invalido o ausente
 */
router.get(
  '/events/available',
  validateJWT,
  availableEventsValidator,
  checkValidators,
  occupancyController.available,
);

/**
 * @openapi
 * /events/full:
 *   get:
 *     summary: Listar eventos con cupo completo
 *     tags: [Occupancy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos con cupo completo
 *       401:
 *         description: Token invalido o ausente
 */
router.get(
  '/events/full',
  validateJWT,
  fullEventsValidator,
  checkValidators,
  occupancyController.full,
);

/**
 * @openapi
 * /summary:
 *   get:
 *     summary: Obtener el resumen general de ocupacion de todos los eventos
 *     tags: [Occupancy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen de ocupacion
 *       401:
 *         description: Token invalido o ausente
 */
router.get(
  '/summary',
  validateJWT,
  summaryValidator,
  checkValidators,
  occupancyController.summary,
);

module.exports = router;
