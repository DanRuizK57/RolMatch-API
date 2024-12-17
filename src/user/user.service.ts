import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

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
  ) { }

  /**
   * Crea un usuario y lo guarda en la base de datos.
   * @param createUserDto - El usuario a registrar.
   * @returns Usuario creado.
   */
  async create(createUserDto: CreateUserDto) {
    try {
      // Validar que no exista un usuario registrado con ese correo
      const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
      
      if (existingUser) {
          throw new BadRequestException('This email is already in use!');
      }

      const user = this.usersRepository.create(createUserDto);
      return await this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  /**
   * Busca todos los usuarios almacenados en la base de datos.
   * @returns Lista de todos los usuarios.
   */
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  /**
   * Obtiene un usuario por su id.
   * @param id - Identificador del usuario a obtener.
   * @returns Usuario encontrado.
   */
  async findOne(id: number): Promise<User> {
    try {

      if (id <= 0) throw new BadRequestException('ID must be greather than 0!');

      const user = await this.usersRepository.findOne({ where: { id } });

      if (!user) throw new NotFoundException(`User with ID ${id} not found!`);

      return user;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      } else {
        throw new HttpException(`An unexpected error occurred: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  /**
   * Obtiene un usuario por su email.
   * @param email - Correo electrónico del usuario a obtener.
   * @returns Usuario encontrado.
   */
  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ where: { email } });

      if (!user) throw new NotFoundException(`User with email ${email} not found!`);

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new HttpException(`An unexpected error occurred: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  /**
   * Reporta a un usuario por su id.
   * @param id - Identificador del usuario a reportar.
   * @returns Usuario reportado.
   */
  async report(id: number) {
    try {
      const userToReport = await this.findOne(id);

      if (!userToReport) throw new NotFoundException(`User with ID ${id} not found!`);

      userToReport.reports += 1;

      return await this.usersRepository.save(userToReport);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

}
