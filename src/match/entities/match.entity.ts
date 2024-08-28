import { Column, CreateDateColumn, Double, Entity, IntegerType, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Sport } from "../enums/sport.enum";
import { User } from "src/user/entities/user.entity";
import { Player } from "./player.entity";

/*
  Entidad que representa a un partido del sistema.
*/

@Entity({ name: 'matches' })
export class Match {

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

  @Column({ type: 'enum', enum: Sport })
  sport: Sport;

  @ManyToOne(() => User, (user) => user.matches)
  user: User;

  @OneToMany(() => Player, (player) => player.user)
  players: Player[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}


