import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Medal } from './entities/medal.entity';

/*
    Servicio que gestiona las funciones de gestión de usuarios.
*/
@Injectable()
export class UserService {

  /*
    Constructor que instancia el repositorio de usuarios.
  */
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Medal)
    private readonly medalsRepository: Repository<Medal>
  ) { }

  /**
   * Crea un usuario y lo guarda en la base de datos.
   * @param createUserDto - El usuario a registrar.
   * @returns Usuario creado.
   */
  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  /**
   * Busca todos los usuarios almacenados en la base de datos.
   * @returns Lista de todos los usuarios.
   */
  async findAll() {
    return await this.usersRepository.find();
  }

  /**
   * Obtiene un usuario por su id.
   * @param id - Identificador del usuario a obtener.
   * @returns Usuario encontrado.
   */
  async findOne(id: number) {
    return await this.usersRepository.findOne({
      where: { id },
      relations: ['medals'],
      order: {
          medals: {
              id: 'ASC'
          }
        }
    });
  }

  /**
   * Obtiene un usuario por su email.
   * @param email - Correo electrónico del usuario a obtener.
   * @returns Usuario encontrado.
   */
  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Modifica un usuario y lo guarda en la base de datos.
   * @param id - Identificador del usuario a modificar.
   * @param updateUserDto - El nuevo usuario con los datos modificados.
   * @returns Usuario modificado.
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.findOne(id);

    if (!userToUpdate) throw new NotFoundException();

    Object.assign(userToUpdate, updateUserDto);

    return await this.usersRepository.save(userToUpdate);
  }

  /**
   * Reporta a un usuario por su id.
   * @param id - Identificador del usuario a reportar.
   * @returns Usuario reportado.
   */
  async report(id: number) {
    const userToReport = await this.findOne(id);

    if (!userToReport) throw new NotFoundException();

    userToReport.reports += 1;

    return await this.usersRepository.save(userToReport);;
  }

  /**
   * Recomendar a un usuario por su id.
   * @param userId - Identificador del usuario a recomendar.
   * @returns Usuario recomendado.
   */
   async recommend(userId: number): Promise<void> {
     const user = await this.findOne(+userId);
     console.log(user.id);
     

      // Validar que el usuario existe
      if (!user) {
          throw new Error('User not found');
      }

      user.recommendations += 1;

      //Cantidad de recomendaciones necesarias para ganar una medalla
      const medalLevels = [1, 5, 10, 25, 50, 100];

      if (medalLevels.includes(user.recommendations)) {
          const medal = new Medal();
          medal.level = user.recommendations;
          medal.description = `${user.recommendations} Recomendaciones`;
          medal.user = user;

        user.medals.push(medal);
        await this.medalsRepository.save(medal);
     }

      await this.usersRepository.save(user);
    }
}
