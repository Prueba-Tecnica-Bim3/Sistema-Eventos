const occupancyService = require('./occupancy.service');

const available = async (req, res, next) => {
  try {
    const events = await occupancyService.getAvailableEvents(req.token);

    return res.status(200).json({
      success: true,
      message: 'Eventos con cupos disponibles obtenidos correctamente',
      data: { count: events.length, events },
    });
  } catch (error) {
    return next(error);
  }
};

const full = async (req, res, next) => {
  try {
    const events = await occupancyService.getFullEvents(req.token);

    return res.status(200).json({
      success: true,
      message: 'Eventos con cupo completo obtenidos correctamente',
      data: { count: events.length, events },
    });
  } catch (error) {
    return next(error);
  }
};

const summary = async (req, res, next) => {
  try {
    const data = await occupancyService.getSummary(req.token);

    return res.status(200).json({
      success: true,
      message: 'Resumen de ocupacion obtenido correctamente',
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  available,
  full,
  summary,
};
