import { Controller, Delete, Get, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserService } from 'src/user/user.service';
import { GameService } from 'src/game/game.service';

/*
  Controlador que maneja las solicitudes HTTP para la administración del sistema.
*/
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
    private readonly gameService: GameService,
  ) { }
  
  /**
   * Busca todos los usuarios reportados almacenados en la base de datos.
   * @returns Lista de todos los usuarios reportados.
   */
  @Get('/reported/:id')
  findAllReported(@Param('id') id: string) {
    return this.adminService.findAllReported(+id);
  }

  /**
   * Elimina a un usuario por su id.
   * También elimina todos los partidos que pertenecen al usuario
   * @param id - Identificador del usuario obtenido desde la URL.
   * @returns Usuario eliminado.
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.userService.findOne(+id);
    // const response = await this.gameService.removeAllGamesByUser(user);
    return this.adminService.remove(+id);
  }
}
