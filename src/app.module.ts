import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth/auth.service';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapModule } from './map/map.module';
import { JwtModule } from '@nestjs/jwt';
import { Player } from './game/entities/player.entity';
import { Medal } from './user/entities/medal.entity';
import { Game } from './game/entities/game.entity';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    // Configuración de las variables de entorno
    ConfigModule.forRoot(),
    // Configuaración JWT
    JwtModule.register({
      secret: 'SDRFDSFSDFDSFDSFDSAFSDFSDFDSFSDFDSFDS4WETRETRE',
      signOptions: { expiresIn: '1h' },
    }),
    // Configuración de la base de datos PostgreSQL
    TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.POSTGRESQL_HOST,
        port: +process.env.POSTGRESQL_PORT,
        username: process.env.POSTGRESQL_USERNAME,
        password: process.env.POSTGRESQL_PASSWORD,
        database: process.env.POSTGRESQL_DB_NAME,
        // Ingresar entidades creadas
        entities: [User, Game, Player, Medal],
        // No se debe usar en producción, se pueden perder datos.
        synchronize: true,
    }),
    GameModule,
    MapModule
  ],
  controllers: [],
  providers: [AuthService],
})
export class AppModule {}
