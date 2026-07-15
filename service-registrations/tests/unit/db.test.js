jest.mock('mongoose');

const mongoose = require('mongoose');
const connectDB = require('../../configs/db');

describe('configs/db', () => {
  let exitSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it('stops the process when MongoDB connection fails', async () => {
    mongoose.connect.mockRejectedValue(new Error('connection refused'));

    await connectDB();

    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('connects successfully without exiting the process', async () => {
    mongoose.connect.mockResolvedValue(true);

    await connectDB();

    expect(exitSpy).not.toHaveBeenCalled();
  });
});
