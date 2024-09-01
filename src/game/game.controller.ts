import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { FindGameDto } from './dto/find-game.dto';
import { UserService } from '../user/user.service';
import { NearestGameDto } from '../map/dto/nearest-game.dto';
import { GameService } from './game.service';
import { Game } from './entities/game.entity';

/*
  Controlador que maneja las solicitudes HTTP para la gestión de partidas.
*/
@Controller('games')
export class GameController {

  /*
    Constructor que instancia el servicio de partidas.
  */
  constructor(
    private readonly gameService: GameService,
    private userService: UserService,
  ) { }

  /**
   * Crea una partida y lo guarda en la base de datos.
   * @param createGameDto - La partida obtenida por el body de la petición.
   * @returns Partida creada.
   */
  @Post(':userId')
  async create(
    @Param('userId') userId: string,
    @Body() createGameDto: CreateGameDto
  ) {
    const matchOwner = await this.userService.findOne(+userId);

    // Valida que se encuentre el usuario
    if (!matchOwner) {
      throw new Error('User not found');
    }
    return this.gameService.create(matchOwner, createGameDto);
  }

  /**
   * Busca todas los partidas almacenadas en la base de datos.
   * @returns Lista de todas los partidas.
   */
  @Get()
  findAll() {
    return this.gameService.findAll();
  }

  /**
   * Obtiene una partida por su id.
   * @param id - Identificador de la partida obtenida desde la URL.
   * @returns Partida encontrada.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameService.findOne(+id);
  }

  /**
   * Obtiene todas las partidas portenecientes a su dueño.
   * @param userId - Identificador del usuario dueño de la partida obtenido desde la URL.
   * @returns Partidas encontradas.
   */
  @Get('/user/:userId')
  async findByUser(@Param('userId') userId: string) {
    const user = await this.userService.findOne(+userId);
    return this.gameService.findByUser(user);
  }
  /**
   * Obtiene todas las partidas de un tipo y que no pertenecen al usuario.
   * @param userId - Identificador del usuario dueño de la partida obtenida desde la URL (no se utiliza pero se encuentra debido a un bug(ver README)).
   * @returns Partidas encontradas.
   */
  @Get('/userSearch/:userId')
  async findGameForUser(@Body() findGameDto: FindGameDto) {
    const { id, type } = findGameDto;
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException('ID de usuario no válido');
    }
    return this.gameService.findGameForUser(id, type);
  }

  /**
   * Modifica una partida y la guarda en la base de datos.
   * @param id - Identificador de la partida obtenido desde la URL.
   * @param updateGameDto - La nueva partida obtenida por el body de la petición.
   * @returns Partida modificada.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gameService.update(+id, updateGameDto);
  }

  /**
   * Elimina una partida por su id.
   * @param id - Identificador de la partida obtenida desde la URL.
   * @returns Partida eliminada.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gameService.remove(+id);
  }

  /**
   * Se une a una partida.
   * @param userId - Identificador del usuario obtenido desde la URL.
   * @param matchId - Identificador de la partida obtenida desde la URL.
   * @returns Jugador creado.
   */
  @Post(':gameId/join/:userId')
  async joinGame(
    @Param('userId') userId: number,
    @Param('gameId') gameId: number,
  ): Promise<void> {
    const userToJoin = await this.userService.findOne(+userId);
    const match = await this.gameService.findOne(gameId);

    // Valida que se encuentre el usuario
    if (!userToJoin) {
      throw new Error('User not found');
    }
    await this.gameService.joinGame(userToJoin, match);
  }

  /**
   * Obtiene todos los jugadores de una partida.
   * @param gameId - Identificador de la partida obtenida desde la URL.
   * @returns Lista de jugadores pertenecientes a una partida.
   */
  @Get(':gameId/players')
  async getPlayers(@Param('gameId') gameId: number) {
    const players = await this.gameService.getPlayers(gameId);
    return players;
  }

  /**
   * Abandona una partida.
   * @param userId - Identificador del usuario obtenido desde la URL.
   * @param matchId - Identificador de la partida obtenida desde la URL.
   * @returns Jugador eliminado.
   */
  @Delete(':gameId/leave/:userId')
  async leaveGame(
    @Param('userId') userId: number,
    @Param('gameId') gameId: number,
  ): Promise<void> {
    const userToLeave = await this.userService.findOne(+userId);

    // Valida que se encuentre el usuario
    if (!userToLeave) {
      throw new Error('User not found');
    }
    await this.gameService.leaveGame(userToLeave, gameId);
  }

  /**
   * Encuentra la partida más cercana.
   * @param userId - Identificador del usuario obtenido desde la URL.
   * @returns Partida más cercana.
   */
  @Get('/nearest-game/:userId')
  async nearestGame(@Body() nearestGameDto: NearestGameDto) {
    let { id, type, latitude, longitude } = nearestGameDto;
    console.log(nearestGameDto);
    console.log("--->" + latitude);
    const nearestGame = this.gameService.findNearestGame(id, type, latitude, longitude);
    return nearestGame;
  }

   /**
   * Obtiene las partidas a las que un usuario se ha unido.
   * @param userId - Identificador del usuario obtenido desde la URL.
   * @returns Lista de partidas.
   */
  @Get('joined/:userId')
  async getUserJoinedGames(@Param('userId') userId: number): Promise<Game[]> {
    const games = await this.gameService.getUserJoinedGames(userId);
    return games;
  }
}
