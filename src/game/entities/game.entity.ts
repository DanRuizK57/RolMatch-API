import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Player } from "./player.entity";
import { Type } from "../enums/type.enum";

/*
  Entidad que representa una partida del sistema.
*/

@Entity({ name: 'games' })
export class Game {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  duration: string;

  @Column({ type: 'text' })
  date: string;

  @Column({ type: 'text' })
  hour: string;

  @Column({ type: 'double precision' })
  latitude: number;

  @Column({ type: 'double precision' })
  longitude: number;

  @Column({ type: 'int' })
  playerSlots: number;

  @Column({ type: 'int' })
  totalPlayers: number;

  @Column({ type: 'enum', enum: Type })
  type: Type;

  @ManyToOne(() => User, (user) => user.games)
  user: User;

  @OneToMany(() => Player, (player) => player.user)
  players: Player[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}


