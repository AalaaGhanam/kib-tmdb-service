import { Injectable } from '@nestjs/common';
import { default as Redis } from 'ioredis';
import { REDIS_HOST } from '../config/redis.config';

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis(REDIS_HOST);
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async get(key: string): Promise<any> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }
}
