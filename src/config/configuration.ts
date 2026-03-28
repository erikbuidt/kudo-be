import { Env, type IConfig } from "@/common/interfaces/common.interface"
import { bool, cleanEnv, num, str } from "envalid"

export type ConfigApp = IConfig

export const configuration = (): ConfigApp => {
  const configEnvValidate = cleanEnv(process.env, {
    NODE_ENV: str({ default: Env.PRODUCTION, choices: Object.values(Env) }),
    APP_PORT: num({}),
    APP_VERSION: str({ default: "1" }),
    MINIO_ENDPOINT: str({ default: "localhost" }),
    MINIO_PORT: num({ default: 9000 }),
    MINIO_ACCESS_KEY: str(),
    MINIO_SECRET_KEY: str(),
    MINIO_USE_SSL: bool({ default: false }),
    MINIO_BUCKET_NAME: str(),
    IGNORED_ROUTES: str(),
    DABASE_URL: str(),
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
      url: configEnvValidate.DABASE_URL,
    },
  }
}
