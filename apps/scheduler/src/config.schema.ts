import * as Joi from 'joi';

const PARAMS = {
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
};

export const configSchema = Joi.object<typeof PARAMS>(PARAMS);
