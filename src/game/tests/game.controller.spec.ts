
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GameController } from '../game.controller';
import { GameService } from '../game.service';
import { Game } from '../entities/game.entity';
import { Player } from '../entities/player.entity';
import { Type } from '../enums/type.enum';
import { CreateGameDto } from '../dto/create-game.dto';
import { UserService } from '../../user/user.service';
import { User } from '../../user/entities/user.entity';

/*
  Pruebas de integración para verificar el correcto funcionamiento del módulo de partidas.
*/

describe('GameController', () => {
    let controller: GameController;
    let service: GameService;
    let userService: UserService;
    let gameRepository: Repository<Game>;
    let playerRepository: Repository<Player>;

    const mockedGames = [
        // Se asignan de esta manera para que los detecte como Game y no como Object
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

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                GameService,
                UserService,
                {
                    provide: getRepositoryToken(Game),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Player),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
            ],
        }).compile();

        controller = module.get<GameController>(GameController);
        service = module.get<GameService>(GameService);
        userService = module.get<UserService>(UserService);
        gameRepository = module.get<Repository<Game>>(getRepositoryToken(Game));
        playerRepository = module.get<Repository<Player>>(getRepositoryToken(Player));

        jest.spyOn(service, 'findAll').mockResolvedValue(mockedGames);
    });

    // ############################## Tests para create() ####################################################
    describe('POST /games', () => {

        it('debería crear una partida', async () => {

            const ownerId = 2;

            const owner: User = {
                id: 2,
                firstName: 'Jane',
                lastName: "Doe",
                email: 'jane.doe@example.com',
                picture: '',
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

            const result = await controller.create(ownerId.toString(), createGameDto);

            expect(service.create).toHaveBeenCalledWith(owner, createGameDto);
            expect(result).toEqual(createdGame);  

        });

    });

    
});
