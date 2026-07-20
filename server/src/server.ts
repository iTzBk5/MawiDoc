import app from './app';
import { env } from './config/env';
import logger from './shared/utils/logger';
import { startAppointmentReminderCron } from './shared/cron/appointment-reminder';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 MawiDOC API running on port ${env.PORT}`);
  logger.info(`📋 Environment: ${env.NODE_ENV}`);
  logger.info(`❤️  Health check: http://localhost:${env.PORT}/api/v1/health`);

  startAppointmentReminderCron();
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ err: reason }, 'Unhandled rejection');
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error: Error) => {
  logger.error({ err: error }, 'Uncaught exception');
  server.close(() => process.exit(1));
});

export default server;
