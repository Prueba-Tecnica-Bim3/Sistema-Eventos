/**
 * Modelo de entrada (DTO) del Evento.
 * Única responsabilidad: definir y sanear la forma de los datos que
 * llegan desde el cliente antes de pasar a la capa de servicio,
 * evitando así asignaciones masivas de campos no permitidos.
 */

const CREATABLE_FIELDS = [
  'nombre',
  'fecha',
  'lugar',
  'capacidad',
  'descripcion',
  'categoria',
  'imagen',
  'estado',
];

const UPDATABLE_FIELDS = CREATABLE_FIELDS;

/**
 * Extrae únicamente los campos permitidos de un objeto de entrada.
 */
function pickAllowedFields(source = {}, allowedFields = []) {
  return allowedFields.reduce((acc, field) => {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      acc[field] = source[field];
    }
    return acc;
  }, {});
}

/**
 * Construye el payload de creación de un evento a partir del body de la petición.
 */
function buildCreateEventInput(body) {
  return pickAllowedFields(body, CREATABLE_FIELDS);
}

/**
 * Construye el payload de actualización de un evento a partir del body de la petición.
 */
function buildUpdateEventInput(body) {
  return pickAllowedFields(body, UPDATABLE_FIELDS);
}

module.exports = { buildCreateEventInput, buildUpdateEventInput };
