import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Game } from './game.entity';

/*
  Entidad que representa a un usuario que pertenece a una partida del sistema.
*/

@Entity({ name: 'players' })
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.players)
  user: User;

  @ManyToOne(() => Game, (game) => game.players)
  game: Game;
}
