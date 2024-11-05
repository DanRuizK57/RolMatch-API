import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../../user/user.service';
import { GameController } from '../game.controller';
import { GameService } from '../game.service';
import { Game } from '../entities/game.entity';
import { Player } from '../entities/player.entity';
import { Type } from '../enums/type.enum';
import { CreateGameDto } from '../dto/create-game.dto';

/*
  Pruebas de humo para verificar el correcto funcionamiento del módulo de partidas.
*/
describe('Pruebas de humo para el módulo de partidas', () => {
  let app: INestApplication;
  let controller: GameController;
  let service: GameService;
  let userService: UserService;
  let gameRepository: Repository<Game>;
  let playerRepository: Repository<Player>;
  let userRepository: Repository<User>;
  let owner: User;

  const mockedGames = [
    Object.assign(new Game(), {
      id: 1,
      title: 'Partida',
      description: 'Partida',
      duration: '30 mins',
      date: '30/10/2024',
      hour: '14:30',
      latitude: '3232.234334',
      longitude: '232.4324',
      playerSlots: 4,
      totalPlayers: 6,
      type: Type.Type_1,
      user: { id: 2, firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', picture: '' },
      players: [],
    }),
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    controller = moduleFixture.get<GameController>(GameController);
    service = moduleFixture.get<GameService>(GameService);
    userService = moduleFixture.get<UserService>(UserService);
    gameRepository = moduleFixture.get<Repository<Game>>(getRepositoryToken(Game));
    playerRepository = moduleFixture.get<Repository<Player>>(getRepositoryToken(Player));
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));

    const number = Math.floor(Math.random() * 1000000) + 1;

    // Crear un usuario de prueba en la base de datos
    owner = await userRepository.save({
      firstName: 'Test',
      lastName: 'User',
      email: `test${number}@example.com`,
      picture: '',
    });

    await app.init();
  });

  // Prueba para create()
  it('POST /games/:userId', async () => {

    const createGameDto: CreateGameDto = {
      title: 'Partida de prueba',
      description: 'Partida',
      duration: '1 hora',
      date: '28/10/2024',
      hour: '17:30',
      latitude: 223.324324,
      longitude: 23432.234234,
      playerSlots: 5,
      totalPlayers: 10,
      type: Type.Type_2,
    };

    const response = await request(app.getHttpServer())
      .post(`/games/${owner.id}`)
      .send(createGameDto)
      .expect(201);

    // Se quitan los valores createdAt porque se generan de forma diferente
    const { createdAt: actualCreatedAt, user: actualOwner, ...actualGame } = response.body;
    const { createdAt: responseOwnerDate, ...responseOwner } = actualOwner;
    const { createdAt: ownerDate, ...ownerWithoutDate } = owner;

    const gameId = response.body.id;

    const createdGame = {
      id: gameId,
      title: 'Partida de prueba',
      description: 'Partida',
      duration: '1 hora',
      date: '28/10/2024',
      hour: '17:30',
      latitude: 223.324324,
      longitude: 23432.234234,
      playerSlots: 4,
      totalPlayers: 10,
      type: Type.Type_2,
    };

    jest.spyOn(service, 'create').mockResolvedValue(createdGame as Game);

    // Se compara que sea la misma partida
    expect(actualGame).toEqual(createdGame);
    // Se compara que pertenezca al mismo usuario
    expect(responseOwner).toEqual(ownerWithoutDate);
  });

  // Prueba para findAll()
  it('GET /games', async () => {

    const response = await request(app.getHttpServer())
      .get('/games')
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
  });

  // Prueba para finOne()
  it('GET /games/:id', async () => {

    jest.spyOn(gameRepository, 'findOne').mockResolvedValue(mockedGames[0]);

    const gameId = 1;

    const response = await request(app.getHttpServer())
      .get(`/games/${gameId}`)
      .expect(200);

    expect(response.body).toEqual(mockedGames[0]);
  });

  // Tests para findByUser()
    it('GET /games/user/:userId', async () => {

      const userId = owner.id;

      const mockedGame: Game = Object.assign(new Game(), {
        title: 'Partida de prueba',
        description: "Partida de prueba",
        user: { id: userId } as User,
      });

      jest.spyOn(userService, 'findOne').mockResolvedValue({ id: userId } as User);
      jest.spyOn(service, 'findByUser').mockResolvedValue([mockedGame]);

      const response = await request(app.getHttpServer())
        .get(`/games/user/${userId}`)
        .expect(200);
      
      const games = response.body;

      // Se verifica que las partidas pertenezcan al mismo usuario
      games.forEach(game => {
        expect(game.user.id).toEqual(mockedGame.user.id);
      });
    });

  afterAll(async () => {
    await app.close();
  });
});

