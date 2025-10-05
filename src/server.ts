import { readConfiguration } from '@super-protocol/solution-utils';
import { spawn } from 'child_process';
import fs from 'fs';
import { parentPort } from 'worker_threads';
import { config } from './config';
import { rootLogger } from './logger';
import { getServerConfig } from './server-config';

const logger = rootLogger.child({ module: 'server.js' });

const terminationHandler = (signal: string): never => {
  logger.info(`${signal} received. Stopping`);
  process.exit(0);
};

const handledSignals = ['SIGINT', 'SIGTERM'];
parentPort?.on('message', (message) => {
  if (handledSignals.includes(message)) terminationHandler(message);
});

const run = async (): Promise<void> => {
  const serverConfig = getServerConfig();

  await fs.promises.writeFile(serverConfig.privateKeyFilePath, serverConfig.tlsKey);
  await fs.promises.writeFile(serverConfig.certificateFilePath, serverConfig.tlsCert);

  await readConfiguration(serverConfig.configurationPath);

  const spawnArgs = [
    '--ssl-keyfile', serverConfig.privateKeyFilePath,
    '--ssl-certfile', serverConfig.certificateFilePath,
    '--port', String(serverConfig.port),
    '--host', '0.0.0.0',
  ];

  await new Promise<void>((resolve, reject) => {
    const pythonProcess = spawn(`${serverConfig.engineFolder}/start_linux.sh`, spawnArgs, {
      stdio: 'inherit',
      env: {
        ...process.env,
        HOST: '127.0.0.1',
        PORT: '8000'
      },
    });

    pythonProcess.on('error', (err) => {
      logger.error({ err }, 'Failed to start Python process');
      reject(err);
    });

    pythonProcess.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`start_linux.sh exited with code ${code ?? 'null'}`));
    });
  });
};

run().catch((err) => {
  logger.fatal({ err }, `Anonymizer start command failed`);
  process.exit(1);
});
