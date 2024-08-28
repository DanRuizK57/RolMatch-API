import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

/*
  Entidad que representa a las medallas de usuario del sistema.
*/

@Entity({ name: 'medals' })
export class Medal {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    level: number;

    @Column({ type: 'text' })
    description: string

    @ManyToOne(() => User, (user) => user.medals)
    user: User;
}
