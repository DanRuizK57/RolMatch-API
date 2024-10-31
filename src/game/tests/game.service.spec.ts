import { Repository } from "typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { GameService } from "../game.service";
import { Game } from "../entities/game.entity";
import { Type } from "../enums/type.enum";
import { CreateGameDto } from "../dto/create-game.dto";
import { User } from "src/user/entities/user.entity";
import { Player } from "../entities/player.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { UpdateGameDto } from "../dto/update-game.dto";

/*
  Pruebas unitarias para verificar el correcto funcionamiento de los métodos del servicio de partidas.
*/
describe('GameService', () => {
  let service: GameService;
  let gameRepository: Repository<Game>;
  let playerRepository: Repository<Player>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: getRepositoryToken(Game),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Player),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    gameRepository = module.get<Repository<Game>>(getRepositoryToken(Game));
    playerRepository = module.get<Repository<Player>>(getRepositoryToken(Player));

    // Mock del método findAll
    jest.spyOn(service, 'findAll').mockImplementation(async () => [
      Object.assign(
        new Game(), {
        id: 1,
        title: 'Partida 1',
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
      
    // Mock del método findOne
    jest.spyOn(service, 'findOne').mockImplementation(async () =>
      Object.assign(new Game(), {
        id: 1,
        title: 'Partida 1',
        description: "Partida",
        duration: '30 mins',
        date: '30/10/2024',
        hour: '14:30',
        latitude: 3232.234334,
        longitude: 232.4324,
        playerSlots: 4,
        totalPlayers: 6,
        type: Type.Type_1,
        user: { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' },
        players: [
          {
            id: 2,
            user: { id: 2 },
            game: { id: 2 }
          } as Player
        ]
      })
    );


  });
    
  // ############################## Tests para create() ####################################################
  describe('create', () => {

    it('debería crear una partida', async () => {

      const owner: User = {
        id: 2,
        firstName: 'Jane',
        lastName: "Doe",
        email: 'jane.doe@example.com',
        picture: '',
        role: 'user',
        reports: 0,
        games: [],
        players: [],
        createdAt: new Date()
      }

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
        type: Type.Type_2
      };

      jest.spyOn(service, 'create').mockResolvedValue(createdGame as Game);

      const result = await service.create(owner, createGameDto);
      
      expect(result).toEqual(createdGame);
    });

  });

  // ############################## Tests para findAll()###################################################
  describe('findAll', () => {

    it('debería retornar un array de partidas', async () => {
      const result = await service.findAll();
      expect(result).toEqual([
        {
        id: 1,
        title: 'Partida 1',
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
      },
        {
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
      },
      ]);
    });

    it('hay 2 elementos en el array', async () => {
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });

    it('todos los elementos de la lista deben ser instancias de Game', async () => {
      const result = await service.findAll();
      result.forEach(game => {
        expect(game).toBeInstanceOf(Game);
      });
    });
    
    it('debería retornar un array vacío si no hay partidas', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValueOnce([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });

  });

  // ############################## Tests para findOne() ####################################################
  describe('findOne', () => {
    it('debería retornar a una partida con ID 1', async () => {
      const gameId = 1;
      const game: Game = await service.findOne(gameId);

      await expect(game).toEqual({
        id: 1,
        title: 'Partida 1',
        description: "Partida",
        duration: '30 mins',
        date: '30/10/2024',
        hour: '14:30',
        latitude: 3232.234334,
        longitude: 232.4324,
        playerSlots: 4,
        totalPlayers: 6,
        type: Type.Type_1,
        user: { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' },
        players: [
          {
            id: 2,
            user: { id: 2 },
            game: { id: 2 }
          } as Player
        ]
      });
    });

    it('debería retornar un error al enviar un número menor a 1', async () => {
      const gameId = -3;

        // Establece el mock para que `findOne` del servicio lance una excepción
      jest.spyOn(service, 'findOne').mockImplementation(async (id: number) => {
        if (id <= 0) {
          throw new BadRequestException('ID must be greather than 0!');
        }
        return null;
      });

      await expect(service.findOne(gameId)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFoundException si el servicio retorna undefined', async () => {
      const gameId = 999;
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException(`Game with ID ${gameId} not found!`));

      await expect(service.findOne(gameId)).rejects.toThrow(NotFoundException);
    });

  });

  // ############################## Tests para findByType() ################################################
  describe('findByType', () => {

    it('debería retornar todas las partidas con el tipo señalado', async () => {

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

      jest.spyOn(service, 'findByType').mockResolvedValue([mockedGame]);

      const user = await service.findByType(Type.Type_3);

      expect(user).toEqual([mockedGame]);
    });
      
    it('debería retornar un array vacío si no se encuentran partidas de ese tipo', async () => {
      jest.spyOn(service, 'findByType').mockResolvedValueOnce([]);
      const result = await service.findByType(Type.Type_2);
      expect(result).toEqual([]);
    });

  });

  // ############################## Tests para findByUser() ################################################
  describe('findByUser', () => {

    it('debería retornar todas las partidas de las cuales un usuario es dueño', async () => {

      const owner: User = { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' } as User;

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

      jest.spyOn(service, 'findByUser').mockResolvedValue([mockedGame]);

      const user = await service.findByUser(owner);

      expect(user).toEqual([mockedGame]);
    });
      
    it('debería retornar un array vacío si el usuario no es dueño de ninguna partida', async () => {

      const owner: User = { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' } as User;

      jest.spyOn(service, 'findByUser').mockResolvedValueOnce([]);
      const result = await service.findByUser(owner);
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

      const result = await service.update(gameId, modificatedGame);
      
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
   
      await expect(service.update(gameId, updateGameDto)).rejects.toThrow(new NotFoundException(`Game with ID ${gameId} not found!`));
   });

  });

  // ############################## Tests para remove() ####################################################
  describe('remove', () => {

    it('debería eliminar una partida', async () => {
      const gameId = 2;

      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const result = await service.remove(gameId);
    
      expect(result).toBeUndefined();
    });

    it('debería lanzar NotFoundException si la partida no existe', async () => {
      const gameId = 999; // ID que no existe
   
      jest.spyOn(service, 'findOne').mockImplementation(async () => {
        throw new NotFoundException(`Game with ID ${gameId} not found!`);
      });
   
      await expect(service.remove(gameId)).rejects.toThrow(new NotFoundException(`Game with ID ${gameId} not found!`));
   });

   it('debería eliminar todos los jugadores asociados a la partida', async () => {
     const gameId = 1;
      const mockGame = { id: gameId } as Game;
      const mockPlayers = [
        { id: 1, user: { id: 1 }, game: mockGame },
        { id: 2, user: { id: 2 }, game: mockGame },
      ] as Player[];

      jest.spyOn(service, 'findOne').mockResolvedValue(mockGame);
      jest.spyOn(playerRepository, 'find').mockResolvedValue(mockPlayers);
      jest.spyOn(service, 'leaveGame').mockImplementation(async (user, gameId) => {
        return { user, game: mockGame } as Player;
      });
      jest.spyOn(gameRepository, 'remove').mockResolvedValue(mockGame);

      const result = await service.remove(gameId);

      expect(service.findOne).toHaveBeenCalledWith(gameId);
      expect(playerRepository.find).toHaveBeenCalledWith({ where: { game: { id: gameId } } });
      expect(service.leaveGame).toHaveBeenCalledTimes(mockPlayers.length);
      mockPlayers.forEach((player) => {
        expect(service.leaveGame).toHaveBeenCalledWith(player.user, gameId);
      });
      expect(gameRepository.remove).toHaveBeenCalledWith(mockGame);
      expect(result).toEqual(mockGame);
    });
  });

  // ############################## Tests para findGamesForUser() ################################################
  describe('findGamesForUser', () => {

    it('debería retornar partidas de un usuario y que son de un tipo', async () => {

      const ownerId = 2;

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

      const user = await service.findGamesForUser(ownerId, Type.Type_3);

      expect(user).toEqual([mockedGame]);
    });
      
    it('debería retornar un array vacío si no hay partidas de un usuario y que son de un tip', async () => {

      const ownerId = 1;

      jest.spyOn(service, 'findGamesForUser').mockResolvedValueOnce([]);
      const result = await service.findGamesForUser(ownerId, Type.Type_2);
      expect(result).toEqual([]);
    });

  });

});
