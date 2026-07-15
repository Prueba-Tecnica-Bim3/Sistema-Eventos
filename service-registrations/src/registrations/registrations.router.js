const express = require('express');
const validateJWT = require('../../middlewares/validate-JWT');
const checkValidators = require('../../middlewares/checkValidators');
const registrationsController = require('./registrations.controller');
const {
  createRegistrationValidator,
  cancelRegistrationValidator,
  listAttendeesValidator,
} = require('./registrations.validators');

const router = express.Router();

/**
 * @openapi
 * /registrations:
 *   post:
 *     summary: Registrar un asistente a un evento
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId, attendeeName, attendeeEmail]
 *             properties:
 *               eventId:
 *                 type: string
 *               attendeeName:
 *                 type: string
 *               attendeeEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Inscripcion registrada correctamente
 *       400:
 *         description: Error de validacion
 *       401:
 *         description: Token invalido o ausente
 *       404:
 *         description: El evento no existe
 *       409:
 *         description: Evento lleno o inscripcion duplicada
 */
router.post(
  '/registrations',
  validateJWT,
  createRegistrationValidator,
  checkValidators,
  registrationsController.create,
);

/**
 * @openapi
 * /registrations/{id}:
 *   delete:
 *     summary: Cancelar una inscripcion
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inscripcion cancelada correctamente
 *       401:
 *         description: Token invalido o ausente
 *       404:
 *         description: Inscripcion no encontrada
 *       409:
 *         description: La inscripcion ya estaba cancelada
 */
router.delete(
  '/registrations/:id',
  validateJWT,
  cancelRegistrationValidator,
  checkValidators,
  registrationsController.cancel,
);

/**
 * @openapi
 * /events/{id}/attendees:
 *   get:
 *     summary: Listar asistentes inscritos a un evento
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [confirmed, cancelled, all]
 *     responses:
 *       200:
 *         description: Lista de asistentes
 *       401:
 *         description: Token invalido o ausente
 */
router.get(
  '/events/:id/attendees',
  validateJWT,
  listAttendeesValidator,
  checkValidators,
  registrationsController.listAttendees,
);

module.exports = router;
