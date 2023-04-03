import { Get, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));
  app.useStaticAssets(join(__dirname, '..', 'static'));
  // app.enableCors({
  //   origin: [
  //     'http://localhost:3001',
  //     'https://busker.shop',
  //     'http://localhost:3000',
  //     'https://port-0-busker-client-4fuvwk25lcrlelfh.gksl2.cloudtype.app',
  //   ],
  //   credentials: true,
  // });
  app.useGlobalPipes(new ValidationPipe());
  app.use(graphqlUploadExpress());
  await app.listen(3000);
}
bootstrap();
