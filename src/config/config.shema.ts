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
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().required(),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
};

export const configSchema = Joi.object<typeof PARAMS>(PARAMS);
