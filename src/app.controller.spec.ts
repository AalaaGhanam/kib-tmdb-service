import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('ping tmdb service', () => {
    it('should return ping response', async () => {
      const request = {
        url: 'https://',
        headers: {},
      };
      const response = {
        greeting: 'Hello from TMDB',
        date: new Date(),
        url: request.url,
        headers: Object.assign({}, request.headers),
      };
      const pingResponse = await appController.ping(request);

      expect(pingResponse).toEqual(response);
    });
  });
});
