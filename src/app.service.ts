import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async ping(req: Request) {
    return {
      greeting: 'Hello from TMDB',
      date: new Date(),
      url: req.url,
      headers: Object.assign({}, req.headers),
    };
  }
}
