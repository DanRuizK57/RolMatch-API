import {
  Controller,
  Request,
  Res,
  Post,
  Get,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AccessTokenDto } from './dto/accessToken.dto';

/*
  Controlador que maneja las solicitudes HTTP para la autenticación del usuario.
*/
@Controller('auth')
export class AuthController {

  /*
    Constructor que instancia los servicios de autenticación y usuarios.
  */
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  /**
   * Obtiene el usuario mediante el token de acceso proporcionado por el frontend y lo guarda en la base de datos si es necesario.
   * @param req - Datos obtenidos de la petición.
   * @param res - Daotos de la respuesta de la petición.
   * @returns Objeto con el usuario logueado, el accessToken y el refreshToken.
   */
  @Post('google/callback')
  async callback(@Request() req, @Res() res: Response) {
    try {
      // Obtener el token de acceso desde el frontend
      const accessToken = req.headers.authorization;
      console.log('Access Token:', accessToken);

      // Obtener todos los datos de la autenticación
      const googleUser = await this.authService.getUserByToken(accessToken);

      console.log(googleUser);

      // Buscar usuario en la base de datos
      const databaseUser = await this.userService.findByEmail(googleUser.email);

      // Crear usuario compatible para guardar
      const userToSave = {
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        email: googleUser.email,
        picture: googleUser.picture
      }

      // Registrar usuario en la base de datos
      if (!databaseUser) {
        await this.userService.create(userToSave)
        const databaseUser = await this.userService.findByEmail(userToSave.email);
        console.log(databaseUser);
        res.status(200).json(databaseUser);
      }
      console.log(databaseUser);
      // Devolver el usuario logueado
      res.status(200).json(databaseUser);

    } catch (error) {
      console.error('Error to login:', error);
      res.status(500).json({ message: 'Error to login' });
    }

  }

  /**
   * Obtiene el usuario mediante el token de acceso.
   * @param accessTokenDto - Token de acceso proporcionado por el frontend.
   * @returns Objeto con el usuario logueado.
   */
  @Get('/user')
  async getUser(@Body() accessTokenDto: AccessTokenDto) {
    const { accessToken } = accessTokenDto;
    return this.authService.getUserByToken(accessToken);
  }

}
