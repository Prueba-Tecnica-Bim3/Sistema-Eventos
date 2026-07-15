const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Estados posibles del ciclo de vida de un evento.
 */
const EVENT_STATUSES = ['activo', 'cancelado', 'finalizado'];

/**
 * Esquema de persistencia del Evento.
 * Única responsabilidad: definir la estructura, validaciones y restricciones
 * del documento tal como se almacena en MongoDB.
 */
const eventSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del evento es obligatorio'],
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
      maxlength: [150, 'El nombre no puede exceder los 150 caracteres'],
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha del evento es obligatoria'],
    },
    lugar: {
      type: String,
      required: [true, 'El lugar del evento es obligatorio'],
      trim: true,
      minlength: [3, 'El lugar debe tener al menos 3 caracteres'],
      maxlength: [200, 'El lugar no puede exceder los 200 caracteres'],
    },
    capacidad: {
      type: Number,
      required: [true, 'La capacidad máxima es obligatoria'],
      min: [1, 'La capacidad debe ser mayor que cero'],
      validate: {
        validator: Number.isInteger,
        message: 'La capacidad debe ser un número entero',
      },
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [1000, 'La descripción no puede exceder los 1000 caracteres'],
      default: '',
    },
    categoria: {
      type: String,
      trim: true,
      maxlength: [80, 'La categoría no puede exceder los 80 caracteres'],
      default: null,
    },
    imagen: {
      type: String,
      trim: true,
      default: null,
    },
    estado: {
      type: String,
      enum: {
        values: EVENT_STATUSES,
        message: 'El estado debe ser uno de: activo, cancelado, finalizado',
      },
      default: 'activo',
    },
  },
  {
    timestamps: true,
  }
);

// Índices para optimizar las búsquedas por nombre, fecha y lugar.
eventSchema.index({ nombre: 1 });
eventSchema.index({ fecha: 1 });
eventSchema.index({ lugar: 1 });

// Evita registrar eventos duplicados (mismo nombre, fecha y lugar).
eventSchema.index({ nombre: 1, fecha: 1, lugar: 1 }, { unique: true });

const EventModel = mongoose.model('Event', eventSchema);

module.exports = EventModel;
module.exports.EVENT_STATUSES = EVENT_STATUSES;
