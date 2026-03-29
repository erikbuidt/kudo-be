import { Env, type IConfig } from "@/common/interfaces/common.interface"
import { bool, cleanEnv, num, str } from "envalid"

export type ConfigApp = IConfig

export const configuration = (): ConfigApp => {
  const configEnvValidate = cleanEnv(process.env, {
    NODE_ENV: str({ default: Env.PRODUCTION, choices: Object.values(Env) }),
    APP_PORT: num({ default: 3000 }),
    APP_VERSION: str({ default: "1" }),
    MINIO_ENDPOINT: str({ default: "localhost" }),
    MINIO_PORT: num({ default: 9000 }),
    MINIO_ACCESS_KEY: str({ default: "" }),
    MINIO_SECRET_KEY: str({ default: "" }),
    MINIO_USE_SSL: bool({ default: false }),
    MINIO_BUCKET_NAME: str({ default: "kudo" }),
    IGNORED_ROUTES: str({ default: "" }),
    DATABASE_URL: str(),
    JWT_SECRET: str(),
    GOOGLE_CLIENT_ID: str(),
    GOOGLE_CLIENT_SECRET: str(),
    GOOGLE_CALLBACK_URL: str({ default: 'http://localhost:3000/auth/google/callback' }),
    REDIS_HOST: str({ default: 'localhost' }),
    REDIS_PORT: num({ default: 6379 }),
    REDIS_PASSWORD: str({ default: 'redis123!' }),
  })

  return {
    env: configEnvValidate.NODE_ENV,
    app: {
      port: configEnvValidate.APP_PORT,
      version: configEnvValidate.APP_VERSION,
    },
    minio: {
      endPoint: configEnvValidate.MINIO_ENDPOINT,
      port: configEnvValidate.MINIO_PORT,
      accessKey: configEnvValidate.MINIO_ACCESS_KEY,
      secretKey: configEnvValidate.MINIO_SECRET_KEY,
      useSSL: configEnvValidate.MINIO_USE_SSL,
      bucketName: configEnvValidate.MINIO_BUCKET_NAME,
    },
    database: {
      url: configEnvValidate.DATABASE_URL,
    },
    google: {
      clientId: configEnvValidate.GOOGLE_CLIENT_ID,
      clientSecret: configEnvValidate.GOOGLE_CLIENT_SECRET,
      callbackUrl: configEnvValidate.GOOGLE_CALLBACK_URL,
    },
    redis: {
      host: configEnvValidate.REDIS_HOST,
      port: configEnvValidate.REDIS_PORT,
      password: configEnvValidate.REDIS_PASSWORD,
    },
  }
}
