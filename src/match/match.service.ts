import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { Not, Repository } from 'typeorm';
import { Sport } from './enums/sport.enum';
import { User } from 'src/user/entities/user.entity';
import { Player } from './entities/player.entity';

/*
    Servicio que gestiona las funciones de gestión de partidos.
*/
@Injectable()
export class MatchService {

  /*
     Constructor que instancia el repositorio de partidos.
  */
  constructor(
    @InjectRepository(Match)
    private readonly matchesRepository: Repository<Match>,
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
  ) { }

  /**
   * Crea un partido y lo guarda en la base de datos.
   * @param createMatchDto - El partido a registrar.
   * @returns Partido creado.
   */
  async create(owner: User, createMatchDto: CreateMatchDto) {

    // Valida que los cupos no pueden ser mayor que el número total de jugadores
    if (createMatchDto.playerSlots > createMatchDto.totalPlayers) {
      throw new Error('Player Slots can not be higher than Total Players.');
    }

    const match = this.matchesRepository.create({
      ...createMatchDto,
      user: owner,
    });

    const savedMatch = await this.matchesRepository.save(match);

    // Añadir el dueño del partido como jugador
    this.joinMatch(owner, savedMatch);

    return savedMatch;
  }

  /**
   * Busca todos los partidos almacenados en la base de datos.
   * @returns Lista de todos los partidos.
   */
  async findAll() {
    return await this.matchesRepository.find();
  }

  /**
   * Obtiene un partido por su id.
   * @param id - Identificador del partido a obtener.
   * @returns Partido encontrado.
   */
  async findOne(id: number) {
    return await this.matchesRepository.findOne({ where: { id } });
  }

  /**
   * Obtiene un partido por el deporte al que corresponde.
   * @param id - Identificador del partido a obtener.
   * @returns Partido encontrado.
   */
  async findBySport(sport: Sport) {
    return await this.matchesRepository.findOne({ where: { sport } });
  }

  /**
   * Obtiene un partido del cual un usuario en específico es dueño.
   * @param user - Usuario dueño del partido a obtener.
   * @returns Partido encontrado.
   */
  async findByUser(user: User): Promise<Match[]> {
    const matches = await this.matchesRepository.find({
      where: { user: { id: user.id } },
    });

    return matches;
  }

  /**
   * Modifica un partido y lo guarda en la base de datos.
   * @param id - Identificador del partido a modificar.
   * @param updateMatchDto - El nuevo partido con los datos modificados.
   * @returns Partido modificado.
   */
  async update(id: number, updateMatchDto: UpdateMatchDto) {
    const matchToUpdate = await this.findOne(id);

    if (!matchToUpdate) throw new NotFoundException();

    Object.assign(matchToUpdate, updateMatchDto);

    return await this.matchesRepository.save(matchToUpdate);
  }

  /**
   * Elimina a un partido por su id.
   * @param id - Identificador del partido a eliminar.
   * @returns Partido eliminado.
   */
  async remove(id: number) {
    const matchToRemove = await this.findOne(id);

    if (!matchToRemove) throw new NotFoundException();

    const players = await this.playersRepository.find({ where: { match: { id: id } } });

    // Saca del partido a los usuarios que se han unido
    if (players) {
      players.forEach((player) => {
        this.leaveMatch(player.user, id);
      });
    }

    return await this.matchesRepository.remove(matchToRemove);
  }

  /**
   * Se busca partido de interes para el usuario.
   * @param id - Id del usuario.
   * @param sport - Tipo de deporte por el que se filtra.
   * @returns partidos que no pertenecen al usuario y son del tipo de deporte buscado.
   */
  async findMatchForUser(id: number, sport: Sport): Promise<Match[]> {
    const matches = await this.matchesRepository.find({
      where: {
        user: { id: Not(id) },
        sport: sport
      },
    });

    return matches;
  }

  /**
   * Añade a un jugador al partido.
   * @param user - Usuario obtenido.
   * @param match - Partido obtenido.
   * @returns Jugador creado.
   */
  async joinMatch(user: User, match: Match): Promise<Player> {

    // Validar que el usuario y el partido existen
    if (!user || !match) {
      throw new Error('User or Match not found');
    }

    if (match.playerSlots <= 0) {
      throw new Error('The player slots of this match are full!');
    }

    const players = await this.getPlayers(match.id);

    players.forEach(player => {
      if (player.user.id == user.id) throw Error("This player is already in the match!");
    });

    const player = new Player();
    player.user = user;
    player.match = match;

    // Ocupa un slot libre del partido
    match.playerSlots--;

    // Se actualiza el aprtido
    this.matchesRepository.save(match);

    return this.playersRepository.save(player);
  }

  /**
   * Obtiene todos los jugadores de un partido.
   * @param matchId - Identificador del partido obtenido.
   * @returns Lista de jugadores pertenecientes a un partido.
   */
  async getPlayers(matchId: number) {
    const match = await this.findOne(matchId);

    // Valida que existe el partido
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    const players = await this.playersRepository.find({
      where: { match: { id: matchId } },
      relations: ['user.medals'],
    });

    return players;
  }

  /**
   * Elimina a un jugador de un partido.
   * @param userId - Identificador del usuario obtenido.
   * @param matchId - Identificador del partido obtenido.
   * @returns Jugador eliminado.
   */
  async leaveMatch(user: User, matchId: number): Promise<Player> {

    const match = await this.findOne(matchId);

    // Validar que el usuario y el partido existen
    if (!user || !match) {
      throw new Error('User or Match not found');
    }

    const playerToRemove = await this.playersRepository.findOne({
      where:
        { user: { id: user.id }, match: { id: matchId } }
    });

    // Validar que el jugador existe
    if (!playerToRemove) {
      throw new NotFoundException('User is not a player of this match');
    }

    // Se libera un slot del partido
    match.playerSlots++;

    // Se actualiza el aprtido
    this.matchesRepository.save(match);

    return this.playersRepository.remove(playerToRemove);
  }

  /**
   * Encuentra el partido más cercano.
   * @param userId - Identificador del usuario.
   * @returns Partido más cercano.
   */
  async findNearestMatch(id: number, sport: Sport, latitude: number, longitude: number): Promise<Match> {
    const matches = await this.matchesRepository.find({
      where: {
        user: { id: Not(id) },
        sport: sport
      },
    });
    console.log(matches);
    console.log("A" + latitude)
    let nearestMatch: Match = null;
    let minDistance = Infinity;

    for (const match of matches) {
      const distance = this.calculateDistance(latitude, longitude, match.latitude, match.longitude);
      console.log(distance);
      if (distance < minDistance) {
        minDistance = distance;
        console.log("------------------------------");
        console.log(match);
        nearestMatch = match;
      }
    }
    console.log(`Match más cercano encontrado: ${nearestMatch}`);
    return nearestMatch;
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
   * Obtiene los partidos a los que un usuario se ha unido.
   * @param userId - Usuario obtenido.
   * @returns Lista de partidos.
   */
  async getUserJoinedMatches(userId: number): Promise<Match[]> {
    const players = await this.playersRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['match'],
    });
 
    let playerMatches = []
    players.forEach(player => {
      playerMatches.push(player.match)
    });
    
    return playerMatches;
  }
}
