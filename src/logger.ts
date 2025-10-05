import pino from 'pino';
import { config } from './config';

export const rootLogger = pino({ level: config.logLevel }).child({
  app: config.appName,
  version: config.appVersion,
});
