import * as request from 'supertest';
import { INestApplication, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
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

  const mockedGames = [
        Object.assign(
        new Game(), {
        id: 1,
        title: 'Partida',
        description: "Partida",
        duration: '30 mins',
        date: '30/10/2024',
        hour: '14:30',
        latitude: '3232.234334',
        longitude: '232.4324',
        playerSlots: '4',
        totalPlayers: '6',
        type: Type.Type_1,
        user: { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' },
        players: []
      }),
      Object.assign(new Game(), {
        id: 2,
        title: 'Partida 2',
        description: "Partida 2",
        duration: '20 mins',
        date: '31/10/2024',
        hour: '10:30',
        latitude: '3232.234334',
        longitude: '232.4324',
        playerSlots: '4',
        totalPlayers: '6',
        type: Type.Type_1,
        user: { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' },
        players: []
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
    
    await app.init();
  });

  // Prueba para create()
  it('POST /games', async () => {

    const ownerId = 2;

    const owner: User = {
        id: 2,
        firstName: 'Jane',
        lastName: "Doe",
        email: 'jane.doe@example.com',
    } as User;

    const createGameDto: CreateGameDto = {
        title: "Partida",
        description: "Partida",
        duration: "1 hora",
        date: "28/10/2024",
        hour: "17:30",
        latitude: 223.324324,
        longitude: 23432.234234,
        playerSlots: 5,
        totalPlayers: 10,
        type: Type.Type_2
    };

    const createdGame = {
        id: 1,
        title: "Partida",
        description: "Partida",
        duration: "1 hora",
        date: "28/10/2024",
        hour: "17:30",
        latitude: 223.324324,
        longitude: 23432.234234,
        playerSlots: 5,
        totalPlayers: 10,
        type: Type.Type_2,
        user: owner
    };

    jest.spyOn(userService, 'findOne').mockResolvedValue(owner as User);

    jest.spyOn(service, 'create').mockResolvedValue(createdGame as Game);

    const response = await request(app.getHttpServer())
      .post(`/games/${ownerId}`)
      .send(createGameDto)
      .expect(201);

    expect(service.create).toHaveBeenCalledWith(owner, createGameDto);
    expect(response).toEqual(createdGame); 

  });

  afterAll(async () => {
    await gameRepository.query('DELETE FROM "games" WHERE "title" = $1', ['Partida']);
    await app.close();
  });
});
