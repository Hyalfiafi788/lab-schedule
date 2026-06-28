import log from 'electron-log';
import path from 'path';
import { app } from 'electron';

export function initLogger(): void {
  // Log to file in userData
  const logPath = path.join(app.getPath('userData'), 'logs');
  log.transports.file.resolvePath = () => path.join(logPath, 'main.log');
  log.transports.file.level = 'info';
  log.transports.file.maxSize = 5 * 1024 * 1024; // 5 MB
  log.transports.console.level = process.env.NODE_ENV === 'development' ? 'debug' : 'warn';

  // Override console so renderer logs also go to file
  log.initialize({ preload: true });

  log.info('=== Lab Schedule Pro ===');
  log.info('Version:', app.getVersion());
  log.info('Platform:', process.platform);
  log.info('Log path:', log.transports.file.getFile().path);
}

export function getLogPath(): string {
  return path.join(app.getPath('userData'), 'logs', 'main.log');
}

export { log };
