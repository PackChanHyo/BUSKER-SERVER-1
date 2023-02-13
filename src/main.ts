import { Get, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableCors({
    origin: [
      'https://busker.shop',
      'http://localhost:3000',
      'https://port-0-busker-client-4fuvwk25lcrlelfh.gksl2.cloudtype.app/',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Access-Control-Allow-Headers',
      'Authorization',
      'X-Requested-With',
      'Content-Type',
      'Accept',
    ],
    credentials: true,
    exposedHeaders: ['Authorization', 'Set-Cookie', 'Cookie'],
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(graphqlUploadExpress());
  await app.listen(3000);
}
bootstrap();
