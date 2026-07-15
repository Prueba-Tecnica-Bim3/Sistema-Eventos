const registrationsService = require('./registrations.service');

const create = async (req, res, next) => {
  try {
    const { eventId, attendeeName, attendeeEmail } = req.body;

    const { registration, occupancy } = await registrationsService.registerAttendee({
      eventId,
      attendeeName,
      attendeeEmail,
      registeredBy: req.user?.userId || req.user?.sub || req.user?.email,
      token: req.token,
    });

    return res.status(201).json({
      success: true,
      message: 'Inscripcion registrada correctamente',
      data: { registration, occupancy },
    });
  } catch (error) {
    return next(error);
  }
};

const cancel = async (req, res, next) => {
  try {
    const registration = await registrationsService.cancelRegistration(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Inscripcion cancelada correctamente',
      data: { registration },
    });
  } catch (error) {
    return next(error);
  }
};

const listAttendees = async (req, res, next) => {
  try {
    const { id } = req.params;
    const status = req.query.status || 'confirmed';

    const attendees = await registrationsService.getAttendeesByEvent(id, status);

    return res.status(200).json({
      success: true,
      message: 'Asistentes obtenidos correctamente',
      data: { eventId: id, count: attendees.length, attendees },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  create,
  cancel,
  listAttendees,
};
