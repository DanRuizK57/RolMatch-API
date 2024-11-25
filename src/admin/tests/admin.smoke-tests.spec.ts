import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../../user/user.service';
import { AdminController } from '../admin.controller';
import { AdminService } from '../admin.service';
import { GameService } from '../../game/game.service';
import { Game } from '../../game/entities/game.entity';
import { Type } from '../../game/enums/type.enum';
import { Player } from '../../game/entities/player.entity';

/*
  Pruebas de humo para verificar el correcto funcionamiento del módulo de administración.
*/
describe('Pruebas de humo para el módulo de administración', () => {
  let app: INestApplication;
  let controller: AdminController;
  let service: AdminService;
  let gameService: GameService;
  let userService: UserService;
  let gameRepository: Repository<Game>;
  let userRepository: Repository<User>;
  let playerRepository: Repository<Player>
  let user: User;
  let game: Game;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    service = moduleFixture.get<AdminService>(AdminService);
    gameService = moduleFixture.get<GameService>(GameService);
    userService = moduleFixture.get<UserService>(UserService);
    gameRepository = moduleFixture.get<Repository<Game>>(getRepositoryToken(Game));
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    playerRepository = moduleFixture.get<Repository<Player>>(getRepositoryToken(Player));

    const number = Math.floor(Math.random() * 1000000) + 1;

    // Crear un usuario de prueba en la base de datos
    user = await userRepository.save({
      firstName: 'Test',
      lastName: 'User',
      email: `test${number}@example.com`,
      picture: '',
      reports: 6,
    });

    game = await gameRepository.save({
        title: "Partida de prueba 1",
        description: "Partida",
        duration: '40 mins',
        date: '23/11/2024',
        hour: '10:30',
        latitude: 3232.234334,
        longitude: 64232.4324,
        playerSlots: 5,
        totalPlayers: 10,
        type: Type.Type_3,
        user: user,
        players: []
    });
    
    await playerRepository.save({
      user: user,
      game: game
    })

    await app.init();
  });

  // Prueba para findAllReported()
  it('GET /admin/reported/:userId', async () => {

    const response = await request(app.getHttpServer())
      .get(`/admin/reported/${user.id}`)
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
  });

  // Prueba para removeReports()
  it('PATCH /admin/reports/reset/:userId', async () => {

    const response = await request(app.getHttpServer())
      .patch(`/admin/reports/reset/${user.id}`)
      .expect(200);

    expect(response.body.reports).toBe(0);
  });

  // Prueba para remove()
  it('DELETE /admin/:id', async () => {

    const response = await request(app.getHttpServer())
      .delete(`/admin/${user.id}`)
      .expect(200);

    expect(response.body.email).toEqual(user.email);

    const deletedUser = await userRepository.findOne({ where: { id: user.id } });
    expect(deletedUser).toBeNull();

    const relatedGames = await gameRepository.find({ where: { user: { id: user.id } } });
    expect(relatedGames.length).toBe(0);
  });
  

  afterAll(async () => {
    await app.close();
  });
});

