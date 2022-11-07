import { ConfigService, ConfigModule } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';

export const getJWTConfig = (): JwtModuleAsyncOptions => ({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService) => ({
    secret: configService.get('JWT_SECRET'),
  }),
});
