import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Medal } from 'src/user/entities/medal.entity';

/*
  Módulo que gestiona los recursos que se utilizarán en la autenticación.
*/

@Module({
  imports: [PassportModule, TypeOrmModule.forFeature([User, Medal])],
  providers: [AuthService, UserService],
  controllers: [AuthController],
})
export class AuthModule {}
