import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Player } from "../../game/entities/player.entity";
import { Medal } from "./medal.entity";
import { Game } from "src/game/entities/game.entity";

/*
  Entidad que representa a un usuario del sistema.
*/

@Entity({ name: 'users' })
export class User { 
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text'})
    firstName: string;

    @Column({ type: 'text' })
    lastName: string;

    @Column({ type: 'text', unique: true })
    email: string;

    @Column({ type: 'text', nullable: true })
    picture: string;

    @Column({ type: 'text', default: "Temuco" })
    city: string;

    @Column({ type: 'text', default: "user"})
    role: string;

    @Column({ type: 'int', default: 0})
    reports: number;
  
    @OneToMany(() => Game, (game) => game.user)
    games: Game[];

    @OneToMany(() => Player, (player) => player.user)
    players: Player[];
  
    @OneToMany(() => Medal, (medal) => medal.user)
    medals: Medal[];

    @Column({ type: 'int', default: 0 })
    recommendations: number;

    @CreateDateColumn({ type: 'timestamp'})
    createdAt: Date;
}
