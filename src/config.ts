import dotenv from 'dotenv';
import path from 'path';
import { getEnvValueOrFail } from './env-utils';

dotenv.config();

export const config = {
  appName: 'yma-tunnel-client',
  appVersion: process.env.APP_VERSION || '0.1.0',
  blockchainUrl: getEnvValueOrFail('BLOCKCHAIN_URL'),
  blockchainContractAddress: getEnvValueOrFail('BLOCKCHAIN_CONTRACT_ADDRESS'),
  logLevel: process.env.LOG_LEVEL || 'trace',
  inputDataFolder: process.env.INPUT_DATA_FOLDER || '/sp/inputs',
  secretsDataFolder: process.env.SECRETS_DATA_FOLDER || '/sp/secrets',
  certFileName: process.env.CERT_FILE_NAME || 'certificate.crt',
  certPrivateKeyFileName: process.env.CERT_PRIVATE_KEY_FILE_NAME || 'private.pem',
  clientServerPort: 9000,
  serverFilePath: path.join(__dirname, './server.js'),
  configurationPath: process.env.CONFIGURATION_PATH || '/sp/configurations/configuration.json',
  localServerStartTimeoutMs: Number.parseInt(process.env.LOCAL_SERVER_START_TIMEOUT_MS || '900000', 10)
};
