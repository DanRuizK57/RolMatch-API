import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
    return await this.usersRepository.findOne({ where: { id } });
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

}
