import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Player } from './entities/player.entity';
import { Game } from './entities/game.entity';
import { Type } from './enums/type.enum';

/*
    Servicio que gestiona las funciones de gestión de partidas.
*/
@Injectable()
export class GameService {

  /*
     Constructor que instancia el repositorio de partidas.
  */
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
  ) { }

  /**
   * Crea una partida y lo guarda en la base de datos.
   * @param createGameDto - La partida a registrar.
   * @returns Partida creada.
   */
  async create(owner: User, createGameDto: CreateGameDto) {

    // Valida que los cupos no pueden ser mayor que el número total de jugadores
    if (createGameDto.playerSlots > createGameDto.totalPlayers) {
      throw new Error('Player Slots can not be higher than Total Players.');
    }

    const game = this.gamesRepository.create({
      ...createGameDto,
      user: owner,
    });

    const savedGame = await this.gamesRepository.save(game);

    // Añadir el dueño de la partida como jugador
    this.joinGame(owner, savedGame);

    return savedGame;
  }

  /**
   * Busca todas los partidas almacenadas en la base de datos.
   * @returns Lista de todos las partidas.
   */
  async findAll() {
    return await this.gamesRepository.find();
  }

  /**
   * Obtiene un partida por su id.
   * @param id - Identificador del partida a obtener.
   * @returns Partida encontrada.
   */
  async findOne(id: number) {
    return await this.gamesRepository.findOne({ where: { id } });
  }

  /**
   * Obtiene una partida por el tipo al que corresponde.
   * @param id - Identificador de la partida a obtener.
   * @returns Partida encontrada.
   */
  async findByType(type: Type) {
    return await this.gamesRepository.findOne({ where: { type } });
  }

  /**
   * Obtiene una partida de la cual un usuario en específico es dueño.
   * @param user - Usuario dueño del partida a obtener.
   * @returns Partida encontrada.
   */
  async findByUser(user: User): Promise<Game[]> {
    const games = await this.gamesRepository.find({
      where: { user: { id: user.id } },
    });

    return games;
  }

  /**
   * Modifica una partida y la guarda en la base de datos.
   * @param id - Identificador de la partida a modificar.
   * @param updateGameDto - El nuevo partida con los datos modificados.
   * @returns Partida modificada.
   */
  async update(id: number, updateGameDto: UpdateGameDto) {
    const gameToUpdate = await this.findOne(id);

    if (!gameToUpdate) throw new NotFoundException();

    Object.assign(gameToUpdate, updateGameDto);

    return await this.gamesRepository.save(gameToUpdate);
  }

  /**
   * Elimina una partida por su id.
   * @param id - Identificador del partida a eliminar.
   * @returns Partida eliminada.
   */
  async remove(id: number) {
    const gameToRemove = await this.findOne(id);

    if (!gameToRemove) throw new NotFoundException();

    const players = await this.playersRepository.find({ where: { game: { id: id } } });

    // Saca de la partida a los usuarios que se han unido
    if (players) {
      players.forEach((player) => {
        this.leaveGame(player.user, id);
      });
    }

    return await this.gamesRepository.remove(gameToRemove);
  }

  /**
   * Se busca partida de interés para el usuario.
   * @param id - Id del usuario.
   * @param type - Tipo de partida por el que se filtra.
   * @returns Partidas que no pertenecen al usuario y son del tipo de deporte buscado.
   */
  async findGameForUser(id: number, type: Type): Promise<Game[]> {
    const games = await this.gamesRepository.find({
      where: {
        user: { id: Not(id) },
        type: type
      },
    });

    return games;
  }

  /**
   * Añade a un jugador a la partida.
   * @param user - Usuario obtenido.
   * @param match - Partida obtenida.
   * @returns Jugador creado.
   */
  async joinGame(user: User, game: Game): Promise<Player> {

    // Validar que el usuario y el partida existen
    if (!user || !game) {
      throw new Error('User or Game not found');
    }

    if (game.playerSlots <= 0) {
      throw new Error('The player slots of this game are full!');
    }

    const players = await this.getPlayers(game.id);

    players.forEach(player => {
      if (player.user.id == user.id) throw Error("This player is already in the game!");
    });

    const player = new Player();
    player.user = user;
    player.game = game;

    // Ocupa un slot libre del partida
    game.playerSlots--;

    // Se actualiza el aprtido
    this.gamesRepository.save(game);

    return this.playersRepository.save(player);
  }

  /**
   * Obtiene todos los jugadores de una partida.
   * @param gameId - Identificador de la partida obtenida.
   * @returns Lista de jugadores pertenecientes a una partida.
   */
  async getPlayers(gameId: number) {
    const game = await this.findOne(gameId);

    // Valida que existe el partida
    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }

    const players = await this.playersRepository.find({
      where: { game: { id: gameId } },
      relations: ['user', 'game']
    });

    return players;
  }

  /**
   * Elimina a un jugador de una partida.
   * @param userId - Identificador del usuario obtenido.
   * @param gameId - Identificador de la partida obtenida.
   * @returns Jugador eliminado.
   */
  async leaveGame(user: User, gameId: number): Promise<Player> {

    const game = await this.findOne(gameId);

    // Validar que el usuario y la partida existen
    if (!user) {
      throw new Error('User not found');
    }

    if (!game) {
      throw new Error('Game not found');
    }

    const playerToRemove = await this.playersRepository.findOne({
      where:
        { user: { id: user.id }, game: { id: gameId } }
    });

    // Validar que el jugador existe
    if (!playerToRemove) {
      throw new NotFoundException('User is not a player of this game');
    }

    // Se libera un slot de la partida
    game.playerSlots++;

    // Se actualiza la partida
    this.gamesRepository.save(game);

    return this.playersRepository.remove(playerToRemove);
  }

  /**
   * Encuentra la partida más cercana.
   * @param userId - Identificador del usuario.
   * @returns Partida más cercana.
   */
  async findNearestGame(id: number, type: Type, latitude: number, longitude: number): Promise<Game> {
    const games = await this.gamesRepository.find({
      where: {
        user: { id: Not(id) },
        type: type
      },
    });
    console.log(games);
    console.log("A" + latitude)
    let nearestGame: Game = null;
    let minDistance = Infinity;

    for (const game of games) {
      const distance = this.calculateDistance(latitude, longitude, game.latitude, game.longitude);
      console.log(distance);
      if (distance < minDistance) {
        minDistance = distance;
        console.log("------------------------------");
        console.log(game);
        nearestGame = game;
      }
    }
    console.log(`Game más cercano encontrado: ${nearestGame}`);
    return nearestGame;
  }

  /**
   * Calcular la distancia.
   * @param lat1 - Latitud del punto 1.
   * @param lon1 - Longitud del punto 1.
   * @param lat2 - Latitud del punto 2.
   * @param lon2 - Longitud del punto 2.
   * @returns Distancia.
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    console.log(`lat1: ${lat1}, lon1: ${lon1}, lat2: ${lat2}, lon2: ${lon2}`);
    const R = 6371; // Radio de la tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    console.log("D" + distance);
    return distance;
  }

  /**
   * Convierte grados a radianes.
   * @param deg - Grados a transformar.
   * @returns Radianes.
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Obtiene las partidas a los que un usuario se ha unido.
   * @param userId - Usuario obtenido.
   * @returns Lista de partidas.
   */
  async getUserJoinedGames(userId: number): Promise<Game[]> {
    const players = await this.playersRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['game'],
    });
 
    let playerGames = []
    players.forEach(player => {
      playerGames.push(player.game)
    });
    
    return playerGames;
  }

  /**
   * Elimina todas las partidas de un usuario.
   * @param user - Usuario obtenido.
   */
  async removeAllGamesFromUser(user: User) {
    const games = await this.findByUser(user);
    
    if (!games) throw new NotFoundException();

    games.forEach(game => {
      this.remove(game.id);
    });
  }

  /**
   * Se elimina a un usuario como jugador de todos los partidos a los que se ha unido.
   * @param user - Usuario obtenido.
   */
  async leaveAllGames(user: User) {
    // Se obtienen todas las partidas
    const games = await this.findAll();

    games.forEach(async game => {
      console.log(game);
      
      // Se obtienen todos los jugadores de cada partida
      const players = await this.getPlayers(game.id);

      if (players.length < 1) throw new NotFoundException('No se encontraron jugadores para esta partida.');

      players.forEach(async player => {
        
        // Si un jugador coincide con el usuario, lo saca
        if (player.user.id == user.id) {
          this.leaveGame(player.user, game.id);
        }
      })
    });
  }
}
