/**
 * Envuelve un controlador asíncrono para propagar automáticamente
 * cualquier error al middleware centralizado de manejo de errores.
 * Única responsabilidad: evitar la repetición de bloques try/catch
 * en cada controlador.
 */
function catchAsync(handler) {
  return function asyncRouteHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = { catchAsync };
