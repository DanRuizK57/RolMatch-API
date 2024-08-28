import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Player } from './entities/player.entity';
import { Medal } from 'src/user/entities/medal.entity';

/*
  Módulo que gestiona los recursos que se utilizarán en la gestión de partidos.
*/

@Module({
  imports: [TypeOrmModule.forFeature([Match, User, Player, Medal])],
  controllers: [MatchController],
  providers: [MatchService, UserService],
  exports: [TypeOrmModule, MatchService]
})
export class MatchModule {}
