
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
import { FindGameDto } from '../dto/find-game.dto';
import { UpdateGameDto } from '../dto/update-game.dto';
import { NearestGameDto } from '../dto/nearest-game.dto';

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
    describe('create', () => {

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

    // ############################## Tests para findAll() ####################################################
    describe('findAll', () => {

        it('debería retornar una lista de partidas', async () => { 

            const result = await controller.findAll();

            expect(result).toEqual([
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
            ]);
        });

        it('hay 2 elementos en el array', async () => {
            const result = await controller.findAll();
            expect(result).toHaveLength(2);
        });

        it('todos los elementos de la lista deben ser instancias de Game', async () => {
            const result = await controller.findAll();
            result.forEach(game => {
                expect(game).toBeInstanceOf(Game);
            });
        });
        
        it('debería retornar un array vacío si no hay partidas', async () => {
            jest.spyOn(service, 'findAll').mockResolvedValueOnce([]);
            const result = await controller.findAll();
            expect(result).toEqual([]);
        });

    });

    // ############################## Tests para findOne() ####################################################
    describe('findOne', () => {

        it('debería retornar una partida', async () => { 

            const gameId = 1;

            jest.spyOn(service, 'findOne').mockResolvedValue(mockedGames[0]);

            const result = await controller.findOne(gameId.toString());

            expect(result).toEqual(
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
            );
        });

        it('debería retornar un error al enviar un número menor a 1', async () => {
            const gameId = -3;

            // Mock para que 'findOne' retorne una excepción
            jest.spyOn(service, 'findOne').mockRejectedValue(new BadRequestException('ID must be greather than 0!'));

            await expect(controller.findOne(gameId.toString())).rejects.toThrow(BadRequestException);
        });

        it('debería retornar un error al enviar una letra', async () => {
            const gameId = "a";

            // Mock para que 'findOne' retorne una excepción
            jest.spyOn(service, 'findOne').mockRejectedValue(new BadRequestException('ID must be a number!'));

            await expect(controller.findOne(gameId)).rejects.toThrow(BadRequestException);
        });

        it('debería lanzar NotFoundException si el servicio retorna undefined', async () => {
            const gameId = 111;
            jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException(`Game with ID ${gameId} not found!`));

            await expect(controller.findOne(gameId.toString())).rejects.toThrow(NotFoundException);
        });

    });

    // ############################## Tests para findByUser() ################################################
    describe('findByUser', () => {

      it('debería retornar todas las partidas de las cuales un usuario es dueño', async () => {

          const userId = 2;

        const mockedGame: Game = Object.assign(new Game(), {
          id: 3,
          title: 'Partida 3',
          description: "Partida 3",
          duration: '50 mins',
          date: '30/10/2024',
          hour: '14:30',
          latitude: '3232.234334',
          longitude: '232.4324',
          playerSlots: '4',
          totalPlayers: '6',
          type: Type.Type_3,
          user: { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' },
          players: []
        });

        jest.spyOn(userService, 'findOne').mockResolvedValue({ id: userId } as User);
        jest.spyOn(service, 'findByUser').mockResolvedValue([mockedGame]);

        const game = await controller.findByUser(userId.toString());

        expect(game).toEqual([mockedGame]);
      });
        
      it('debería retornar un array vacío si el usuario no es dueño de ninguna partida', async () => {

        const userId = 4;

          jest.spyOn(userService, 'findOne').mockResolvedValue({ id: userId } as User);
          jest.spyOn(service, 'findByUser').mockResolvedValueOnce([]);

        const result = await controller.findByUser(userId.toString());
        expect(result).toEqual([]);
      });

    });
    
    // ############################## Tests para findGamesForUser() #########################################
    describe('findGamesForUser', () => {

      it('debería retornar partidas de un usuario y que son de un tipo', async () => {

          const ownerId = 2;
          
          const findGameDto: FindGameDto = {
              id: ownerId,
              type: Type.Type_3
          };

        const mockedGame: Game = Object.assign(new Game(), {
          id: 3,
          title: 'Partida 3',
          description: "Partida 3",
          duration: '50 mins',
          date: '30/10/2024',
          hour: '14:30',
          latitude: '3232.234334',
          longitude: '232.4324',
          playerSlots: '4',
          totalPlayers: '6',
          type: Type.Type_3,
          user: { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' },
          players: []
        });

        jest.spyOn(service, 'findGamesForUser').mockResolvedValue([mockedGame]);

        const games = await controller.findGamesForUser(findGameDto);

        expect(games).toEqual([mockedGame]);
      });
        
      it('debería retornar un array vacío si no hay partidas de un usuario y que son de un tip', async () => {

          const ownerId = 1;
          
          const findGameDto: FindGameDto = {
              id: ownerId,
              type: Type.Type_2
          };

        jest.spyOn(service, 'findGamesForUser').mockResolvedValueOnce([]);
        const result = await controller.findGamesForUser(findGameDto);
        expect(result).toEqual([]);
      });

    });
    
    // ############################## Tests para update() ####################################################
    describe('update', () => {

      it('debería actualizar una partida', async () => {

        const updateGameDto: UpdateGameDto = {
          title: "Partida Modificada",
          description: "Partida Modificada",
          duration: "50 min",
          date: "31/10/2024",
          hour: "16:30",
          latitude: 223.324324,
          longitude: 23432.234234,
          playerSlots: 5,
          totalPlayers: 10,
          type: Type.Type_2
        };

        const gameId = 4;

        const modificatedGame = {
          id: 4,
          title: "Partida Modificada",
          description: "Partida Modificada",
          duration: "50 min",
          date: "31/10/2024",
          hour: "16:30",
          latitude: 223.324324,
          longitude: 23432.234234,
          playerSlots: 5,
          totalPlayers: 10,
          type: Type.Type_2,
          user: { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' },
          players: []
        };

        jest.spyOn(service, 'update').mockResolvedValue(modificatedGame as Game);

        const result = await controller.update(gameId.toString(), updateGameDto);
        
        expect(result).toEqual(modificatedGame);
      });

      it('debería lanzar NotFoundException si la partida no existe', async () => {
        const gameId = 999; // ID que no existe

        const updateGameDto: UpdateGameDto = {
          title: "Partida Modificada",
          description: "Partida Modificada",
          duration: "50 min",
          date: "31/10/2024",
          hour: "16:30",
          latitude: 223.324324,
          longitude: 23432.234234,
          playerSlots: 5,
          totalPlayers: 10,
          type: Type.Type_2
        };
    
        jest.spyOn(service, 'findOne').mockImplementation(async () => {
          throw new NotFoundException(`Game with ID ${gameId} not found!`);
        });
    
        await expect(controller.update(gameId.toString(), updateGameDto)).rejects.toThrow(new NotFoundException(`Game with ID ${gameId} not found!`));
    });

    });
    
    // ############################## Tests para remove() ####################################################
    describe('remove', () => {

      it('debería eliminar una partida', async () => {
        const gameId = 2;

        jest.spyOn(service, 'remove').mockResolvedValue(undefined);

        const result = await controller.remove(gameId.toString());
      
        expect(result).toBeUndefined();
      });

      it('debería lanzar NotFoundException si la partida no existe', async () => {
        const gameId = 999; // ID que no existe
    
        jest.spyOn(service, 'findOne').mockImplementation(async () => {
          throw new NotFoundException(`Game with ID ${gameId} not found!`);
        });
    
        await expect(controller.remove(gameId.toString())).rejects.toThrow(new NotFoundException(`Game with ID ${gameId} not found!`));
    });

    });
    
    // ############################## Tests para joinGame() ################################################
    describe('joinGame', () => {

      it('debería ingresar a la partida', async () => {
          const user = { id: 1 } as User;
          const game = { id: 1, playerSlots: 5 } as Game;
          const newPlayer = { user, game } as Player;

          jest.spyOn(userService, 'findOne').mockResolvedValue(user);
          jest.spyOn(service, 'findOne').mockResolvedValue(game);
          
          jest.spyOn(service, 'joinGame').mockResolvedValue(newPlayer);
          
          await controller.joinGame(user.id, game.id); // Cambia a await

          expect(userService.findOne).toHaveBeenCalledWith(user.id);
          expect(service.findOne).toHaveBeenCalledWith(game.id);
          expect(service.joinGame).toHaveBeenCalledWith(user, game);
      });

    it('debería lanzar un NotFoundException si el usuario no existe', async () => {
        const gameId = 1;
        
        const userId = 999; // ID de usuario inexistente

        jest.spyOn(userService, 'findOne').mockResolvedValue(null);
        jest.spyOn(service, 'findOne').mockResolvedValue({ id: 1 } as Game);

      await expect(controller.joinGame(userId, gameId)).rejects.toThrow(NotFoundException);
      });


    it('debería lanzar un NotFoundException si la partida no existe', async () => {
        const user = { id: 1 } as User;
        
        const gameId = 988;

      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.joinGame(user.id, gameId)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar un error si ya no quedan cupos disponibles', async () => {
      const user = { id: 1 } as User;
      const game = { id: 1, playerSlots: 0 } as Game;

      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest.spyOn(service, 'findOne').mockResolvedValue(game);

      await expect(controller.joinGame(user.id, game.id)).rejects.toThrow(new Error('The player slots of this game are full!'));
    });

    it('debería lanzar un error si el usuario ya es un jugador de la partida', async () => {
      const user = { id: 1 } as User;
      const game = { id: 1, playerSlots: 5 } as Game;
      const existingPlayer = { user, game } as Player;

      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest.spyOn(service, 'findOne').mockResolvedValue(game);
      jest.spyOn(service, 'getPlayers').mockResolvedValue([existingPlayer]);

      await expect(controller.joinGame(user.id, game.id)).rejects.toThrow(new Error('This player is already in the game!'));
    });

    });
    
    // ############################## Tests para getPlayers() ####################################################
    describe('getPlayers', () => {
      it('debería retornar los jugadores de una partida con ID 1', async () => {
        const gameId = 1;

        jest.spyOn(service, 'getPlayers').mockImplementation(async () =>
          [
            {
              id: 2,
              user: { id: 2 },
              game: { id: 2 }
            } as Player
          ]
        );

        const players = await controller.getPlayers(gameId);

        await expect(players).toEqual([
          {
              id: 2,
              user: { id: 2 },
              game: { id: 2 }
            } as Player
        ]);
      });

      it('debería retornar un error al enviar un número menor a 1', async () => {
        const gameId = -3;

          // Establece el mock para que `findOne` del servicio lance una excepción
          jest.spyOn(service, 'getPlayers').mockImplementation(async (id: number) => {
          if (id <= 0) {
            throw new BadRequestException('ID must be greather than 0!');
          }
          return null;
        });

        await expect(controller.getPlayers(gameId)).rejects.toThrow(BadRequestException);
      });

      it('debería lanzar NotFoundException si el servicio retorna undefined', async () => {
        const gameId = 999;
        jest.spyOn(service, 'getPlayers').mockRejectedValue(new NotFoundException(`Game with ID ${gameId} not found!`));

        await expect(controller.getPlayers(gameId)).rejects.toThrow(NotFoundException);
      });

    });
    
    // ############################## Tests para leaveGame() ####################################################
    describe('leaveGame', () => {
    
    it('debería permitir a un usuario salir de la partida', async () => {
      const userId = 1;
      const gameId = 1;
      const user = { id: userId } as User;

      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      
      jest.spyOn(service, 'leaveGame').mockResolvedValue(undefined);

      await controller.leaveGame(userId, gameId);

      expect(userService.findOne).toHaveBeenCalledWith(userId);
      expect(service.leaveGame).toHaveBeenCalledWith(user, gameId);
    });

    it('debería lanzar un NotFoundException si el usuario no existe', async () => {
      const userId = 1;
      const gameId = 1;

      jest.spyOn(userService, 'findOne').mockResolvedValue(null);

      await expect(controller.leaveGame(userId, gameId)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar un error si la partida no existe', async () => {
      const userId = 1;
      const gameId = 999; // ID de partida inexistente
      const user = { id: userId } as User;

      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      
      jest.spyOn(service, 'leaveGame').mockRejectedValue(new Error('Game not found'));

      await expect(controller.leaveGame(userId, gameId)).rejects.toThrow(Error);
    });

    });

    // ############################## Tests para nearestGame() ###########################################
    describe('nearestGame', () => {
    
      it('debería retornar el juego más cercano basado en la ubicación y el tipo', async () => {
      
      const nearestGameDto: NearestGameDto = {
        id: 1,
        type: Type.Type_1,
        latitude: 40.712776,
        longitude: -74.005974,
      };

      const expectedNearestGame = {
        id: 2,
        title: 'Partida Cercana',
        latitude: 40.712776,
        longitude: -74.005974,
        type: nearestGameDto.type,
      };

      jest.spyOn(service, 'findNearestGame').mockResolvedValue(expectedNearestGame as Game);

      const result = await controller.nearestGame(nearestGameDto);

      expect(service.findNearestGame).toHaveBeenCalledWith(
        nearestGameDto.id,
        nearestGameDto.type,
        nearestGameDto.latitude,
        nearestGameDto.longitude
      );
      expect(result).toEqual(expectedNearestGame);
    });

    });

    // ############################## Tests para getUserJoinedGames() ########################################
    describe('getUserJoinedGames', () => {

      it('debería retornar todas las partidas de las cuales un usuario se ha unido', async () => {

        const userId = 2;

        const mockedGame: Game = Object.assign(new Game(), {
          id: 3,
          title: 'Partida 3',
          description: "Partida 3",
          duration: '50 mins',
          date: '30/10/2024',
          hour: '14:30',
          latitude: '3232.234334',
          longitude: '232.4324',
          playerSlots: '4',
          totalPlayers: '6',
          type: Type.Type_3,
          user: { id: 1, firstName: 'Jhon', lastName: "Doe", email: 'jhon.doe@example.com', picture: '' },
          players: [
            { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' },
          ]
        });

        jest.spyOn(service, 'getUserJoinedGames').mockResolvedValue([mockedGame]);

        const games = await controller.getUserJoinedGames(userId);

        expect(games).toEqual([mockedGame]);
      });
        
      it('debería retornar un array vacío si el usuario no se ha unido a ninguna partida', async () => {

        const userId = 3;

        jest.spyOn(service, 'getUserJoinedGames').mockResolvedValueOnce([]);
        const result = await controller.getUserJoinedGames(userId);
        expect(result).toEqual([]);
      });

    });
    
});
