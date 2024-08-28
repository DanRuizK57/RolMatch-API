import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { MatchService } from './match.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { FindMatchDto } from './dto/find-match.dto';
import { UserService } from 'src/user/user.service';
import { NearestMatchDto } from 'src/map/dto/nearest-match.dto';
import { Match } from './entities/match.entity';

/*
  Controlador que maneja las solicitudes HTTP para la gestión de partidos.
*/
@Controller('matches')
export class MatchController {

  /*
    Constructor que instancia el servicio de partidos.
  */
  constructor(
    private readonly matchService: MatchService,
    private userService: UserService,
  ) { }

  /**
   * Crea un partido y lo guarda en la base de datos.
   * @param createMatchDto - El partido obtenido por el body de la petición.
   * @returns Partido creado.
   */
  @Post(':userId')
  async create(
    @Param('userId') userId: string,
    @Body() createMatchDto: CreateMatchDto
  ) {
    const matchOwner = await this.userService.findOne(+userId);

    // Valida que se encuentre el usuario
    if (!matchOwner) {
      throw new Error('User not found');
    }
    return this.matchService.create(matchOwner, createMatchDto);
  }

  /**
   * Busca todos los partidos almacenados en la base de datos.
   * @returns Lista de todos los partidos.
   */
  @Get()
  findAll() {
    return this.matchService.findAll();
  }

  /**
   * Obtiene un partido por su id.
   * @param id - Identificador del partido obtenido desde la URL.
   * @returns Partido encontrado.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchService.findOne(+id);
  }

  /**
   * Obtiene todos los partidos portenecientes a su dueño.
   * @param userId - Identificador del usuario dueño del partido obtenido desde la URL.
   * @returns Partidos encontrados.
   */
  @Get('/user/:userId')
  async findByUser(@Param('userId') userId: string) {
    const user = await this.userService.findOne(+userId);
    return this.matchService.findByUser(user);
  }
  /**
   * Obtiene todos los partidos que cumplen con el deporte buscado y no pertenecen al usuario.
   * @param userId - Identificador del usuario dueño del partido obtenido desde la URL (no se utiliza pero se encuentra debido a un bug(ver README)).
   * @returns Partidos encontrados.
   */
  @Get('/userSearch/:userId')
  async findMatchForUser(@Body() findMatchDto: FindMatchDto) {
    const { id, sport } = findMatchDto;
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException('ID de usuario no válido');
    }
    return this.matchService.findMatchForUser(id, sport);
  }

  /**
   * Modifica un partido y lo guarda en la base de datos.
   * @param id - Identificador del partido obtenido desde la URL.
   * @param updateMatchDto - El nuevo partido obtenido por el body de la petición.
   * @returns Partido modificado.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMatchDto: UpdateMatchDto) {
    return this.matchService.update(+id, updateMatchDto);
  }

  /**
   * Elimina a un partido por su id.
   * @param id - Identificador del partido obtenido desde la URL.
   * @returns Partido eliminado.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.matchService.remove(+id);
  }

  /**
   * Se une a un partido.
   * @param userId - Identificador del usuario obtenido desde la URL.
   * @param matchId - Identificador del partido obtenido desde la URL.
   * @returns Jugador creado.
   */
  @Post(':matchId/join/:userId')
  async joinMatch(
    @Param('userId') userId: number,
    @Param('matchId') matchId: number,
  ): Promise<void> {
    const userToJoin = await this.userService.findOne(+userId);
    const match = await this.matchService.findOne(matchId);

    // Valida que se encuentre el usuario
    if (!userToJoin) {
      throw new Error('User not found');
    }
    await this.matchService.joinMatch(userToJoin, match);
  }

  /**
   * Obtiene todos los jugadores de un partido.
   * @param matchId - Identificador del partido obtenido desde la URL.
   * @returns Lista de jugadores pertenecientes a un partido.
   */
  @Get(':matchId/players')
  async getPlayers(@Param('matchId') matchId: number) {
    const players = await this.matchService.getPlayers(matchId);
    return players;
  }

  /**
   * Abandona un partido.
   * @param userId - Identificador del usuario obtenido desde la URL.
   * @param matchId - Identificador del partido obtenido desde la URL.
   * @returns Jugador eliminado.
   */
  @Delete(':matchId/leave/:userId')
  async leaveMatch(
    @Param('userId') userId: number,
    @Param('matchId') matchId: number,
  ): Promise<void> {
    const userToLeave = await this.userService.findOne(+userId);

    // Valida que se encuentre el usuario
    if (!userToLeave) {
      throw new Error('User not found');
    }
    await this.matchService.leaveMatch(userToLeave, matchId);
  }

  /**
   * Encuentra el partido más cercano.
   * @param userId - Identificador del usuario obtenido desde la URL.
   * @returns Partido más cercano.
   */
  @Get('/nearestMatch/:userId')
  async nearestMatch(@Body() nearestMatchDto: NearestMatchDto) {
    let { id, sport, latitude, longitude } = nearestMatchDto;
    console.log(nearestMatchDto);
    console.log("--->" + latitude);
    const nearestMatch = this.matchService.findNearestMatch(id, sport, latitude, longitude);
    return nearestMatch;
  }

   /**
   * Obtiene los partidos a los que un usuario se ha unido.
   * @param userId - Identificador del usuario obtenido desde la URL.
   * @returns Lista de partidos.
   */
  @Get('joined/:userId')
  async getUserJoinedMatches(@Param('userId') userId: number): Promise<Match[]> {
    const matches = await this.matchService.getUserJoinedMatches(userId);
    return matches;
  }
}
