const { body, param, query } = require('express-validator');

const createRegistrationValidator = [
  body('eventId')
    .exists({ checkFalsy: true }).withMessage('eventId es obligatorio')
    .bail()
    .isString().withMessage('eventId debe ser una cadena de texto'),
  body('attendeeName')
    .exists({ checkFalsy: true }).withMessage('attendeeName es obligatorio')
    .bail()
    .isString().withMessage('attendeeName debe ser una cadena de texto')
    .isLength({ min: 3, max: 120 }).withMessage('attendeeName debe tener entre 3 y 120 caracteres'),
  body('attendeeEmail')
    .exists({ checkFalsy: true }).withMessage('attendeeEmail es obligatorio')
    .bail()
    .isEmail().withMessage('attendeeEmail debe ser un correo valido')
    .normalizeEmail(),
];

const cancelRegistrationValidator = [
  param('id')
    .exists({ checkFalsy: true }).withMessage('id es obligatorio')
    .bail()
    .isMongoId().withMessage('id debe ser un identificador valido'),
];

const listAttendeesValidator = [
  param('id')
    .exists({ checkFalsy: true }).withMessage('id es obligatorio'),
  query('status')
    .optional()
    .isIn(['confirmed', 'cancelled', 'all']).withMessage('status debe ser confirmed, cancelled o all'),
];

module.exports = {
  createRegistrationValidator,
  cancelRegistrationValidator,
  listAttendeesValidator,
};
