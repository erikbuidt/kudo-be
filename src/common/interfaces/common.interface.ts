export enum Env {
  DEFAULT = 'default',
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export interface IConfigApp {
  port: number;
  version: string;
}

export interface IConfig {
  env: Env;
  app: IConfigApp;
  minio: MinioOptions;
  database: DatabaseOptions;
  google: GoogleOptions;
  redis: RedisOptions;
}

export interface RedisOptions {
  host: string;
  port: number;
  password?: string;
}

export interface GoogleOptions {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

export interface DatabaseOptions {
  url: string;
}

export interface MinioOptions {
  endPoint: string;
  port: number;
  accessKey: string;
  secretKey: string;
  useSSL: boolean;
  bucketName: string;
  publicUrl?: string;
}

export interface IPaginationMeta {
  /**
   * the amount of items on this specific page
   */
  item_count: number;
  /**
   * the total amount of items
   */
  total_items?: number;
  /**
   * the amount of items that were requested per page
   */
  items_per_page: number;
  /**
   * the total amount of pages in this paginator
   */
  total_pages?: number;
  /**
   * the current page this paginator "points" to
   */
  current_page: number;
}
