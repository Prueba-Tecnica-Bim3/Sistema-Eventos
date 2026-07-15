const { param, query, body } = require('express-validator');
const mongoose = require('mongoose');
const { EVENT_STATUSES } = require('./events.model');

/**
 * Reglas de validación centralizadas para el recurso Evento.
 * Única responsabilidad: declarar las cadenas de validación de
 * express-validator que se ejecutan antes del controlador.
 * El resultado de estas validaciones es evaluado por el middleware
 * `handleValidationErrors`.
 */

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const validateEventId = [
  param('id').custom(isValidObjectId).withMessage('El ID del evento no es válido'),
];

const validateCreateEvent = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 3, max: 150 })
    .withMessage('El nombre debe tener entre 3 y 150 caracteres'),
  body('fecha')
    .notEmpty()
    .withMessage('La fecha es obligatoria')
    .isISO8601()
    .withMessage('La fecha debe tener un formato válido (ISO 8601)')
    .toDate(),
  body('lugar')
    .trim()
    .notEmpty()
    .withMessage('El lugar es obligatorio')
    .isLength({ min: 3, max: 200 })
    .withMessage('El lugar debe tener entre 3 y 200 caracteres'),
  body('capacidad')
    .notEmpty()
    .withMessage('La capacidad es obligatoria')
    .isInt({ min: 1 })
    .withMessage('La capacidad debe ser un número entero mayor que cero')
    .toInt(),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder los 1000 caracteres'),
  body('categoria')
    .optional()
    .trim()
    .isLength({ max: 80 })
    .withMessage('La categoría no puede exceder los 80 caracteres'),
  body('imagen')
    .optional()
    .trim()
    .isURL()
    .withMessage('La imagen debe ser una URL válida'),
  body('estado')
    .optional()
    .isIn(EVENT_STATUSES)
    .withMessage(`El estado debe ser uno de: ${EVENT_STATUSES.join(', ')}`),
];

const validateUpdateEvent = [
  ...validateEventId,
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('El nombre debe tener entre 3 y 150 caracteres'),
  body('fecha')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe tener un formato válido (ISO 8601)')
    .toDate(),
  body('lugar')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('El lugar debe tener entre 3 y 200 caracteres'),
  body('capacidad')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La capacidad debe ser un número entero mayor que cero')
    .toInt(),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder los 1000 caracteres'),
  body('categoria')
    .optional()
    .trim()
    .isLength({ max: 80 })
    .withMessage('La categoría no puede exceder los 80 caracteres'),
  body('imagen')
    .optional()
    .trim()
    .isURL()
    .withMessage('La imagen debe ser una URL válida'),
  body('estado')
    .optional()
    .isIn(EVENT_STATUSES)
    .withMessage(`El estado debe ser uno de: ${EVENT_STATUSES.join(', ')}`),
];

const validateListEvents = [
  query('name').optional().trim().isLength({ min: 1 }).withMessage('El nombre de búsqueda no puede estar vacío'),
  query('date')
    .optional()
    .isISO8601()
    .withMessage('La fecha de búsqueda debe tener un formato válido (ISO 8601)'),
  query('location').optional().trim().isLength({ min: 1 }).withMessage('El lugar de búsqueda no puede estar vacío'),
  query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número entero mayor que cero').toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entero entre 1 y 100')
    .toInt(),
];

module.exports = {
  validateEventId,
  validateCreateEvent,
  validateUpdateEvent,
  validateListEvents,
};
