import { Controller, Get, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

const PING_RESPONSE = {
  title: 'PingResponse',
  properties: {
    greeting: { type: 'string' },
    date: { type: 'string' },
    url: { type: 'string' },
    headers: {
      properties: {
        'Content-Type': { type: 'string' },
      },
      additionalProperties: true,
    },
  },
};

@ApiTags('Ping')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Check service connection.',
  })
  @ApiOkResponse({
    description: 'Ping Response',
    schema: PING_RESPONSE,
  })
  @Get('/ping')
  ping(@Request() req) {
    return this.appService.ping(req);
  }
}
