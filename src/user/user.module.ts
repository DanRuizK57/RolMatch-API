import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { Player } from '../game/entities/player.entity';
import { Medal } from './entities/medal.entity';
import { Game } from 'src/game/entities/game.entity';
import { GameService } from 'src/game/game.service';

/*
  Módulo que gestiona los recursos que se utilizarán en la gestión de usuarios.
*/

@Module({
  imports: [TypeOrmModule.forFeature([User, Game, Player, Medal])],
  controllers: [UserController],
  providers: [UserService, AuthService, GameService],
  exports: [TypeOrmModule, UserService]
})
export class UserModule {}
