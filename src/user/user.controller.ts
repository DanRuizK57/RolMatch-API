import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/*
  Controlador que maneja las solicitudes HTTP para la gestión de usuarios.
*/

@Controller('users')
export class UserController {

  /*
    Constructor que instancia el servicio de usuarios.
  */
  constructor(
    private readonly userService: UserService,
  ) { }

  /**
   * Crea un usuario y lo guarda en la base de datos.
   * @param createUserDto - El usuario obtenido por el body de la petición.
   * @returns Usuario creado.
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * Busca todos los usuarios almacenados en la base de datos.
   * @returns Lista de todos los usuarios.
   */
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  /**
   * Obtiene un usuario por su id.
   * @param id - Identificador del usuario obtenido desde la URL.
   * @returns Usuario encontrado.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }
  /**
   * Modifica un usuario y lo guarda en la base de datos.
   * @param id - Identificador del usuario obtenido desde la URL.
   * @param updateUserDto - El nuevo usuario obtenido por el body de la petición.
   * @returns Usuario modificado.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  /**
   * Reporta un usuario y lo guarda en la base de datos.
   * @param id - Identificador del usuario obtenido desde la URL.
   * @returns Usuario reportado.
   */
  @Patch('/report/:id')
  report(@Param('id') id: string) {
    return this.userService.report(+id);
  }

  /**
   * Recomienda un usuario y lo guarda en la base de datos.
   * @param id - Identificador del usuario obtenido desde la URL.
   * @returns Usuario recomendado.
   */
  @Patch('/recommend/:id')
  recommend(@Param('id') id: string) {
    return this.userService.recommend(+id);
  }
}
