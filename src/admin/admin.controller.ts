import { Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserService } from '../user/user.service';
import { GameService } from '../game/game.service';

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
   * Resetea los reportes de un usuario.
   * @param id - Identificador del usuario obtenido desde la URL.
   * @returns Usuario con el número de reportes en 0.
   */
  @Patch('/reports/reset/:id')
  removeReports(@Param('id') id: string) {
    return this.adminService.removeReports(+id);
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
    await this.gameService.leaveAllGames(user);
    await this.gameService.removeAllGamesFromUser(user);
    return this.adminService.remove(+id);
  }
}
