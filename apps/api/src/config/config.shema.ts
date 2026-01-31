/* eslint-disable prettier/prettier */
import * as Joi from 'joi';
import { EnvironmentEnum } from './environment.enum';

const PARAMS = {
  PORT: Joi.number().default(3000),
  TZ: Joi.string().valid('UTC').required(),
  ENVIRONMENT: Joi.string()
    .valid(...Object.values(EnvironmentEnum))
    .default(EnvironmentEnum.Dev)
    .required(),
  // database
  POSTGRES_HOST: Joi.string().optional(),
  POSTGRES_PORT: Joi.number().optional(),
  POSTGRES_DB: Joi.string().optional(),
  POSTGRES_USER: Joi.string().optional(),
  POSTGRES_PASSWORD: Joi.string().optional(),
  DATABASE_URL: Joi.string().optional(),
  REDIS_URL: Joi.string().optional(),
  REDIS_HOST: Joi.string().optional(),
  REDIS_PORT: Joi.number().optional(),
};

export const configSchema = Joi.object<typeof PARAMS>(PARAMS);
