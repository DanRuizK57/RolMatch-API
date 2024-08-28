import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Match } from 'src/match/entities/match.entity';

/*
  Entidad que representa a un usuario que pertenece a un partido del sistema.
*/

@Entity({ name: 'players' })
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.players)
  user: User;

  @ManyToOne(() => Match, (match) => match.players)
  match: Match;
}
