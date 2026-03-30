import { Test, TestingModule } from '@nestjs/testing';
import { AxiosService } from './axios.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('AxiosService', () => {
  let service: AxiosService;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AxiosService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<AxiosService>(AxiosService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should call httpService.get', async () => {
      const data = { foo: 'bar' };
      mockHttpService.get.mockReturnValue(of({ data }));
      const result = await service.get('http://test.com');
      expect(result).toBe(data);
      expect(mockHttpService.get).toHaveBeenCalledWith('http://test.com', expect.any(Object));
    });
  });

  describe('post', () => {
    it('should call httpService.post', async () => {
      const data = { id: 1 };
      mockHttpService.post.mockReturnValue(of({ data }));
      const result = await service.post('http://test.com', { name: 'test' });
      expect(result).toBe(data);
      expect(mockHttpService.post).toHaveBeenCalledWith('http://test.com', { name: 'test' }, expect.any(Object));
    });
  });

  describe('put', () => {
    it('should call httpService.put', async () => {
      const data = { id: 1 };
      mockHttpService.put.mockReturnValue(of({ data }));
      const result = await service.put('http://test.com', { name: 'test' });
      expect(result).toBe(data);
      expect(mockHttpService.put).toHaveBeenCalledWith('http://test.com', { name: 'test' }, expect.any(Object));
    });
  });

  describe('delete', () => {
    it('should call httpService.delete', async () => {
      const data = { success: true };
      mockHttpService.delete.mockReturnValue(of({ data }));
      const result = await service.delete('http://test.com');
      expect(result).toBe(data);
      expect(mockHttpService.delete).toHaveBeenCalledWith('http://test.com', expect.any(Object));
    });
  });
});
