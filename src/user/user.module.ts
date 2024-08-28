import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { MatchService } from 'src/match/match.service';
import { Match } from 'src/match/entities/match.entity';
import { Player } from 'src/match/entities/player.entity';
import { Medal } from './entities/medal.entity';

/*
  Módulo que gestiona los recursos que se utilizarán en la gestión de usuarios.
*/

@Module({
  imports: [TypeOrmModule.forFeature([User, Match, Player, Medal])],
  controllers: [UserController],
  providers: [UserService, AuthService, MatchService],
  exports: [TypeOrmModule, UserService]
})
export class UserModule {}
