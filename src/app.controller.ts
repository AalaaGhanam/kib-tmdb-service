import { Controller, Get, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse } from '@nestjs/swagger';

const PING_RESPONSE = {
  title: 'PingResponse',
  properties: {
    greeting: {type: 'string'},
    date: {type: 'string'},
    url: {type: 'string'},
    headers: {
      properties: {
        'Content-Type': {type: 'string'},
      },
      additionalProperties: true,
    },
  },
};
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOkResponse({
    description: 'Ping Response',
    schema: PING_RESPONSE
  })
  @Get('/ping')
  ping( @Request() req): Promise<object> {
    return this.appService.ping(req);
  }
}
