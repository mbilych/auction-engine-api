import * as Joi from 'joi';

const PARAMS = {
  REDIS_HOST: Joi.string().optional(),
  REDIS_PORT: Joi.number().optional(),
  REDIS_URL: Joi.string().optional(),
};

export const configSchema = Joi.object<typeof PARAMS>(PARAMS);
