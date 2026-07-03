import { NestFactory } from '@nestjs/core';
import { AppModule } from './module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Allow the Render frontend URL and local dev
  app.enableCors({
    origin: true,   // reflects request origin – safe for a demo; restrict to your Render URL in prod
    credentials: true,
  });

  const PORT = process.env.PORT ?? 8081;
  await app.listen(PORT);
  console.log(`🚀 FinOps API listening on port ${PORT}`);
  console.log('📊 REST API available at /v1/*');
  console.log('🏥 Health Check: /health');
}
bootstrap();


