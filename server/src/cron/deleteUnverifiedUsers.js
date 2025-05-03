import cron from 'node-cron';
import User from '../models/userModel.js';

cron.schedule('0 2 * * *', async () => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  await User.deleteMany({
    isVerified: false,
    createdAt: { $lt: threeDaysAgo },
  });
});
