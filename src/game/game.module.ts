import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { Player } from './entities/player.entity';
import { GameController } from './game.controller';
import { GameService } from './game.service';

/*
  Módulo que gestiona los recursos que se utilizarán en la gestión de partidas.
*/

@Module({
  imports: [TypeOrmModule.forFeature([Game, User, Player])],
  controllers: [GameController],
  providers: [GameService, UserService],
  exports: [TypeOrmModule, GameService]
})
export class GameModule {}
