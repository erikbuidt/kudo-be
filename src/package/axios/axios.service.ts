// biome-ignore lint/style/useImportType: <explanation>
import { HttpModuleOptions, HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { firstValueFrom, map } from 'rxjs'

@Injectable()
export class AxiosService {
  private readonly TIMEOUT = 30_000
  constructor(private readonly service: HttpService) {}

  async get<T>(url: string, config: HttpModuleOptions = {}): Promise<T> {
    const result = this.service
      .get(url, {
        timeout: this.TIMEOUT,
        headers: {
          ...config.headers,
          'Content-Type': 'application/json',
        },
        ...config,
      })
      .pipe(map((response) => response.data))
    return firstValueFrom(result)
  }

  async post<T, E = object>(url: string, data: E, config: HttpModuleOptions = {}): Promise<T> {
    const result = this.service
      .post(url, data, {
        timeout: this.TIMEOUT,
        headers: {
          ...config.headers,
          'Content-Type': 'application/json',
        },
        ...config,
      })
      .pipe(map((response) => response.data))
    return firstValueFrom(result)
  }

  async put<T, E = object>(url: string, data: E, config: HttpModuleOptions = {}): Promise<T> {
    const result = this.service
      .put(url, data, {
        timeout: this.TIMEOUT,
        headers: {
          ...config.headers,
          'Content-Type': 'application/json',
        },
        ...config,
      })
      .pipe(map((response) => response.data))
    return firstValueFrom(result)
  }

  async delete<T>(url: string, config: HttpModuleOptions = {}): Promise<T> {
    const result = this.service
      .delete(url, {
        timeout: this.TIMEOUT,
        headers: {
          ...config.headers,
          'Content-Type': 'application/json',
        },
        ...config,
      })
      .pipe(map((response) => response.data))
    return firstValueFrom(result)
  }
}
