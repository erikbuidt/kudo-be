export enum Env {
  DEFAULT = "default",
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}

export interface IConfigApp {
  port: number
  version: string
}

export interface IClerk {
  apiKey: string
  publishableKey: string
  secretKey: string
}

export interface IConfig {
  env: Env
  app: IConfigApp
  minio: MinioOptions
  database: DatabaseOptions
}

export interface DatabaseOptions {
  url: string
}

export interface MinioOptions {
  endPoint: string
  port: number
  accessKey: string
  secretKey: string
  useSSL: boolean
  bucketName: string
}

export interface IPaginationMeta {
  /**
   * the amount of items on this specific page
   */
  item_count: number
  /**
   * the total amount of items
   */
  total_items?: number
  /**
   * the amount of items that were requested per page
   */
  items_per_page: number
  /**
   * the total amount of pages in this paginator
   */
  total_pages?: number
  /**
   * the current page this paginator "points" to
   */
  current_page: number
}

export interface PublicMetadata {
  db_user_id: number
  role: string
}

export type EncodeByResolution = {
  inputPath: string
  isHasAudio: boolean
  resolution: {
    width: number
    height: number
  }
  outputSegmentPath: string
  outputPath: string
  bitrate: {
    720: number
    1080: number
    1440: number
    original: number
  }
}
