jest.mock('../../src/registrations/registrations.model');
jest.mock('../../src/clients/events.client');

const Registration = require('../../src/registrations/registrations.model');
const eventsClient = require('../../src/clients/events.client');
const occupancyService = require('../../src/occupancy/occupancy.service');

describe('occupancy.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateOccupancy', () => {
    it('computes available and percentage normally', () => {
      const result = occupancyService.calculateOccupancy(10, 4);
      expect(result).toEqual({
        capacity: 10, registered: 4, available: 6, percentage: 40, isFull: false,
      });
    });

    it('never allows available to go negative when overbooked', () => {
      const result = occupancyService.calculateOccupancy(5, 9);
      expect(result.available).toBe(0);
      expect(result.available).toBeGreaterThanOrEqual(0);
      expect(result.isFull).toBe(true);
    });

    it('treats zero capacity as not full with zero percentage', () => {
      const result = occupancyService.calculateOccupancy(0, 0);
      expect(result.percentage).toBe(0);
      expect(result.isFull).toBe(false);
      expect(result.available).toBe(0);
    });
  });

  describe('getAvailableEvents / getFullEvents', () => {
    it('splits events between available and full based on occupancy', async () => {
      eventsClient.getEvents.mockResolvedValue([
        { id: 'e1', name: 'Evento 1', capacity: 10 },
        { id: 'e2', name: 'Evento 2', capacity: 2 },
      ]);
      Registration.countDocuments
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);

      const available = await occupancyService.getAvailableEvents('token');
      expect(available).toHaveLength(1);
      expect(available[0].eventId).toBe('e1');

      Registration.countDocuments
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);
      const full = await occupancyService.getFullEvents('token');
      expect(full).toHaveLength(1);
      expect(full[0].eventId).toBe('e2');
    });
  });

  describe('getSummary', () => {
    it('aggregates totals across all events', async () => {
      eventsClient.getEvents.mockResolvedValue([
        { id: 'e1', name: 'Evento 1', capacity: 10 },
        { id: 'e2', name: 'Evento 2', capacity: 2 },
      ]);
      Registration.countDocuments
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);

      const summary = await occupancyService.getSummary('token');

      expect(summary.totalEvents).toBe(2);
      expect(summary.totalCapacity).toBe(12);
      expect(summary.totalRegistered).toBe(5);
      expect(summary.totalAvailable).toBe(7);
      expect(summary.fullEvents).toBe(1);
      expect(summary.availableEvents).toBe(1);
    });
  });
});
