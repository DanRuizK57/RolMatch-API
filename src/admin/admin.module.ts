import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../game/entities/game.entity';
import { User } from '../user/entities/user.entity';
import { Player } from '../game/entities/player.entity';
import { UserService } from '../user/user.service';
import { GameService } from '../game/game.service';

/*
  Módulo que gestiona los recursos que se utilizarán en la administración del sistema.
*/

@Module({
  imports: [TypeOrmModule.forFeature([Game, User, Player])],
  controllers: [AdminController],
  providers: [AdminService, UserService, GameService],
})
export class AdminModule {}
