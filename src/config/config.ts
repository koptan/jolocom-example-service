import appRootDir from 'app-root-path'
import dotenv from 'dotenv'
import { Assert } from '../assert/assert'
import { Options } from 'swagger-jsdoc'
import { swaggerOptions } from './swagger'

process.env.NODE_ENV = process.env.APP_ENV || 'dev';
process.env.API_VERSION = process.env.API_VERSION || 'v1';

const envFound = dotenv.config()

if (envFound.error) {
  throw new Error('Couldn\'t find .env file')
}

const assertRequiredVariablesDefined = () => {
  Assert.isDefined(process.env.APP_PORT, 'process.env.APP_PORT')
  Assert.isDefined(process.env.APP_ENV, 'process.env.APP_ENV')
  Assert.isDefined(process.env.APP_HOST, 'process.env.APP_HOST')
  Assert.isDefined(process.env.APP_SCHEME, 'process.env.APP_SCHEME')
  Assert.isDefined(process.env.SDK_CALLBACK_URL, 'process.env.SDK_CALLBACK_URL')
}

assertRequiredVariablesDefined()

export interface AppConfig {
  port: string,
  env: string,
  host: string,
  schema: string,
  apiVersion: string,
  apiRootPath: string,
  controllersPath: string,
  fixturesPath: string,

  sdk: {
    passwordFilePath: string,
    callbackUrl: string,
  },

  db: {
    type: string,
    database: string,
    logging: string[],
    entities: string[],
    migrations: string[],
    migrationsRun: boolean,
    synchronize: boolean,
    cli: {
      migrationsDir: string,
    },
  },

  logger: {
    logDir: string,
  },

  swagger: Options
}

export const config: AppConfig = {
  port: process.env.APP_PORT as string,
  env: process.env.APP_ENV as string,
  host: process.env.APP_HOST as string,
  schema: process.env.APP_SCHEME as string,
  apiVersion: process.env.API_VERSION as string,
  apiRootPath: '/api/' + process.env.API_VERSION,
  controllersPath: appRootDir + '/src/controller',
  fixturesPath: appRootDir + '/fixtures',

  sdk: {
    passwordFilePath: process.env.SDK_PASSWORD_FILE_PATH || appRootDir + '/var/password.txt',
    callbackUrl: process.env.SDK_CALLBACK_URL as string,
  },

  db: {
    type: 'sqlite',
    database: appRootDir + '/var/db.sqlite3',
    logging: ['error', 'warn', 'schema'],
    entities: [...require('@jolocom/sdk-storage-typeorm').entityList],
    migrations: [appRootDir + '/migration/*.ts'],
    migrationsRun: true,
    synchronize: true,
    cli: {
      migrationsDir: appRootDir + '/migration',
    },
  },

  logger: {
    logDir: process.env.LOG_DIR || appRootDir + '/var/log',
  },

  swagger: swaggerOptions
}