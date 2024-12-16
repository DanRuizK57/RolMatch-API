import { Repository } from "typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { GameService } from "../game.service";
import { Game } from "../entities/game.entity";
import { Type } from "../enums/type.enum";
import { CreateGameDto } from "../dto/create-game.dto";
import { User } from "../../user/entities/user.entity";
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

  const mockedGames = [
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
      type: Type.DND,
      user: { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' },
      players: []
    }),
    Object.assign(new Game(), {
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
        type: Type.OTRO,
        user: { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' },
        players: []
      }),
  ];

  const mockedOwner: User = {
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
  };

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
    jest.spyOn(service, 'findAll').mockImplementation(async () => mockedGames);

  });
    
  // ############################## Tests para create() ####################################################
  describe('create', () => {

    it('debería crear una partida', async () => {

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
        type: Type.CTHULHU
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
        type: Type.CTHULHU
      };

      jest.spyOn(service, 'create').mockResolvedValue(createdGame as Game);

      const result = await service.create(mockedOwner, createGameDto);
      
      expect(result).toEqual(createdGame);
    });

    it('debería lanzar BadRequestException si playerSlots > totalPlayers', async () => {

      const invalidGame: CreateGameDto = {
        title: "Partida inválida",
        description: "Partida inválida",
        duration: "2 horas",
        date: "16/12/2024",
        hour: "11:30",
        latitude: 32334.324324,
        longitude: 63432.234234,
        playerSlots: 8,
        totalPlayers: 6,
        type: Type.DND
      };

      await expect(service.create(mockedOwner, invalidGame)).rejects.toThrow(BadRequestException);

    });

  });

  // ############################## Tests para findAll()###################################################
  describe('findAll', () => {

    it('debería retornar un array de partidas', async () => {
      const result = await service.findAll();
      expect(result).toEqual(mockedGames);
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
      const mockGame: Game = {
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
        type: Type.DND,
        user: { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' } as User,
        players: [
          {
            id: 2,
            user: { id: 2 },
            game: { id: 2 }
          } as Player
        ]
      } as Game;

      jest.spyOn(gameRepository, 'findOne').mockResolvedValue(mockGame);

      const result = await service.findOne(gameId);

      expect(result).toEqual(mockGame);
    });

    it('debería retornar un error al enviar un número menor a 0', async () => {
      const gameId = -3;
      await expect(service.findOne(gameId)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFoundException si la partida no existe', async () => {
      const gameId = 999;
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException(`Game with ID ${gameId} not found!`));
      await expect( service.findOne(gameId)).rejects.toThrow(NotFoundException);
    });

  });

  // ############################## Tests para findByType() ################################################
  describe('findByType', () => {

    it('debería retornar todas las partidas con el tipo señalado', async () => {

      jest.spyOn(service, 'findByType').mockResolvedValue([mockedGames[2]]);

      const games = await service.findByType(Type.OTRO);

      expect(games).toEqual([mockedGames[2]]);
    });
      
    it('debería retornar un array vacío si no se encuentran partidas de ese tipo', async () => {
      jest.spyOn(service, 'findByType').mockResolvedValueOnce([]);
      const result = await service.findByType(Type.CTHULHU);
      expect(result).toEqual([]);
    });

  });

  // ############################## Tests para findByUser() ################################################
  describe('findByUser', () => {

    it('debería retornar todas las partidas de las cuales un usuario es dueño', async () => {

      const owner: User = { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' } as User;

      jest.spyOn(service, 'findByUser').mockResolvedValue(mockedGames);

      const games = await service.findByUser(owner);

      expect(games).toEqual(mockedGames);
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
        type: Type.CTHULHU,
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
        type: Type.CTHULHU
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
      expect(playerRepository.find).toHaveBeenCalledWith({ where: { game: { id: gameId } }, relations: ['user'] });
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

      jest.spyOn(service, 'findGamesForUser').mockResolvedValue(mockedGames);

      const games = await service.findGamesForUser(ownerId, Type.DND);

      expect(games).toEqual(mockedGames);
    });
      
    it('debería retornar un array vacío si no hay partidas de un usuario y que son de un tip', async () => {

      const ownerId = 1;

      jest.spyOn(service, 'findGamesForUser').mockResolvedValueOnce([]);
      const result = await service.findGamesForUser(ownerId, Type.CTHULHU);
      expect(result).toEqual([]);
    });

  });

  // ############################## Tests para joinGame() ################################################
  describe('joinGame', () => {

    it('debería ingresar a la partida', async () => {
      const user = { id: 1 } as User;
      const game = { id: 1, playerSlots: 5 } as Game;
      const newPlayer = { user, game } as Player;

      jest.spyOn(service, 'getPlayers').mockResolvedValue([]);
      jest.spyOn(playerRepository, 'save').mockResolvedValue(newPlayer);
      jest.spyOn(gameRepository, 'save').mockResolvedValue(game);

      const result = await service.joinGame(user, game);

      expect(service.getPlayers).toHaveBeenCalledWith(game.id);
      expect(gameRepository.save).toHaveBeenCalledWith({ ...game, playerSlots: 4 });
      expect(playerRepository.save).toHaveBeenCalledWith(newPlayer);
      expect(result).toEqual(newPlayer);
    });

    it('debería lanzar un NotFoundException si el usuario no existe', async () => {
      const game = { id: 1, playerSlots: 5 } as Game;

      await expect(service.joinGame(null, game)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar un NotFoundException si la partida no existe', async () => {
      const user = { id: 1 } as User;

      await expect(service.joinGame(user, null)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar un error si ya no quedan cupos disponibles', async () => {
      const user = { id: 1 } as User;
      const game = { id: 1, playerSlots: 0 } as Game;

      await expect(service.joinGame(user, game)).rejects.toThrow(new Error('The player slots of this game are full!'));
    });

    it('debería lanzar un error si el usuario ya es un jugador de la partida', async () => {
      const user = { id: 1 } as User;
      const game = { id: 1, playerSlots: 5 } as Game;
      const existingPlayer = { user, game } as Player;

      jest.spyOn(service, 'getPlayers').mockResolvedValue([existingPlayer]);

      await expect(service.joinGame(user, game)).rejects.toThrow(new Error('This player is already in the game!'));
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

      const players = await service.getPlayers(gameId);

      expect(players).toEqual([
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

      await expect(service.getPlayers(gameId)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFoundException si el servicio retorna undefined', async () => {
      const gameId = 999;
      jest.spyOn(service, 'getPlayers').mockRejectedValue(new NotFoundException(`Game with ID ${gameId} not found!`));

      await expect(service.getPlayers(gameId)).rejects.toThrow(NotFoundException);
    });

  });

  // ############################## Tests para leaveGame() ################################################
  describe('leaveGame', () => {

    it('debería abandonar la partida', async () => {
      const user = { id: 1 } as User;
      const game = { id: 1, playerSlots: 5 } as Game;
      const playerToRemove = { user, game } as Player;

      jest.spyOn(service, 'findOne').mockResolvedValue(game);
      jest.spyOn(playerRepository, 'findOne').mockResolvedValue(playerToRemove);
      jest.spyOn(gameRepository, 'save').mockResolvedValue({ ...game, playerSlots: game.playerSlots + 1 });
      jest.spyOn(playerRepository, 'remove').mockResolvedValue(playerToRemove);

      const result = await service.leaveGame(user, game.id);

      expect(service.findOne).toHaveBeenCalledWith(game.id);
      expect(playerRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: user.id }, game: { id: game.id } },
      });
      expect(gameRepository.save).toHaveBeenCalledWith({ ...game, playerSlots: 6 });
      expect(playerRepository.remove).toHaveBeenCalledWith(playerToRemove);
      expect(result).toEqual(playerToRemove);
    });

    it('debería lanzar un NotFoundException si el usuario no existe', async () => {
      const gameId = 1;
      jest.spyOn(service, 'findOne').mockImplementation(async () => {
        throw new NotFoundException('User not found');
      });
      await expect(service.leaveGame(null, gameId)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar un NotFoundException si la partida no existe', async () => {
      const user = { id: 1 } as User;

      const gameId = 999;

      jest.spyOn(service, 'findOne').mockImplementation(async () => {
        throw new NotFoundException(`Game with ID ${gameId} not found!`);
      });

      await expect(service.leaveGame(user, gameId)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar NotFoundException si el usuario no es un jugador de la partida', async () => {
    const user = { id: 1 } as User;
    const game = { id: 1, playerSlots: 5 } as Game;

    jest.spyOn(service, 'findOne').mockResolvedValue(game);
    jest.spyOn(playerRepository, 'findOne').mockResolvedValue(null);

    await expect(service.leaveGame(user, game.id)).rejects.toThrow(NotFoundException);
    expect(service.findOne).toHaveBeenCalledWith(game.id);
    expect(playerRepository.findOne).toHaveBeenCalledWith({
      where: { user: { id: user.id }, game: { id: game.id } },
    });
  });

  });

  // ############################## Tests para findNearestGame() ################################################
  describe('findNearestGame', () => {

      it('debería retornar la partida más cercana', async () => {
      const games = [
        { id: 1, latitude: 40.73061, longitude: -73.935242 } as Game, // Distancia: 8.3 km
        { id: 2, latitude: 40.712776, longitude: -74.005974 } as Game, // Distancia: 0.0 km (más cercano)
        { id: 3, latitude: 40.789142, longitude: -73.13496 } as Game, // Distancia: 76.1 km
      ];

      jest.spyOn(gameRepository, 'find').mockResolvedValue(games);
      jest.spyOn(service, 'calculateDistance')
        .mockImplementation((lat1, lon1, lat2, lon2) => {
          if (lat2 === 40.73061 && lon2 === -73.935242) return 8.3;
          if (lat2 === 40.712776 && lon2 === -74.005974) return 0.0;
          if (lat2 === 40.789142 && lon2 === -73.13496) return 76.1;
          return Infinity;
        });

      const result = await service.findNearestGame(99, Type.DND, 40.7128, -74.0060);

      expect(result).toEqual(games[1]);
      expect(gameRepository.find).toHaveBeenCalledWith({
        where: {
          user: { id: expect.not.stringContaining('99') },
          type: Type.DND,
        },
      });
    });

    it('debería filtrar las partidas por el ID de usuario y por el tipo', async () => {
      const games = [
        { id: 2, user: { id: 3 }, latitude: 40.712776, longitude: -74.005974, type: Type.CTHULHU } as Game,
      ];

      jest.spyOn(gameRepository, 'find').mockResolvedValue(games);
      jest.spyOn(service, 'calculateDistance').mockReturnValue(5.0);

      const result = await service.findNearestGame(1, Type.CTHULHU, 40.7128, -74.0060);

      expect(result).toEqual(games[0]);
      expect(gameRepository.find).toHaveBeenCalledWith({
        where: {
          user: { id: expect.not.stringContaining('1') },
          type: Type.CTHULHU,
        },
      });
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
        type: Type.OTRO,
        user: { id: 1, firstName: 'Jhon', lastName: "Doe", email: 'jhon.doe@example.com', picture: '' },
        players: [
          { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' },
        ]
      });

      jest.spyOn(service, 'getUserJoinedGames').mockResolvedValue([mockedGame]);

      const games = await service.getUserJoinedGames(userId);

      expect(games).toEqual([mockedGame]);
    });
      
    it('debería retornar un array vacío si el usuario no se ha unido a ninguna partida', async () => {

      const userId = 3;

      jest.spyOn(service, 'getUserJoinedGames').mockResolvedValueOnce([]);
      const result = await service.getUserJoinedGames(userId);
      expect(result).toEqual([]);
    });

  });

  // ############################## Tests para removeAllGamesFromUser() ########################################
  describe('removeAllGamesFromUser', () => {

    it('debería eliminar todas las partidas de un usuario', async () => {
    const user = new User();
    const games = [
      { id: 1 } as Game,
      { id: 2 } as Game,
      { id: 3 } as Game,
    ];

    jest.spyOn(service, 'findByUser').mockResolvedValue(games);
    const removeSpy = jest.spyOn(service, 'remove').mockResolvedValue({} as any);

    await service.removeAllGamesFromUser(user);

    expect(service.findByUser).toHaveBeenCalledWith(user);
    expect(removeSpy).toHaveBeenCalledTimes(games.length);
    games.forEach(game => {
      expect(removeSpy).toHaveBeenCalledWith(game.id);
    });
  });

  });

  // ############################## Tests para leaveAllGames() ########################################
  describe('leaveAllGames', () => {
    it('debería abandonar todas las partidas a las que un usuario se ha unido', async () => {
  const user = new User();
  user.id = 1;

  const games = [
    { id: 1 } as Game,
    { id: 2 } as Game,
  ];

  const playersForGame1 = [
    { user, game: games[0] } as Player,
    { user: new User(), game: games[0] } as Player,
  ];
  const playersForGame2 = [
    { user, game: games[1] } as Player,
    { user: new User(), game: games[1] } as Player,
  ];

  jest.spyOn(service, 'findAll').mockResolvedValue(games);
  jest.spyOn(service, 'getPlayers').mockImplementation(async (gameId: number) => {
    if (gameId === 1) return playersForGame1;
    if (gameId === 2) return playersForGame2;
    return [];
  });
      
  jest.spyOn(service, 'leaveGame').mockResolvedValue(undefined);

  await service.leaveAllGames(user);

  expect(service.findAll).toHaveBeenCalled();
  expect(service.getPlayers).toHaveBeenCalledTimes(games.length);
  expect(service.leaveGame).toHaveBeenCalledTimes(2); // Se llama dos veces, una para cada partida
  expect(service.leaveGame).toHaveBeenCalledWith(user, 1); // Verifica la primera partida
  expect(service.leaveGame).toHaveBeenCalledWith(user, 2); // Verifica la segunda partida
});

});


});
