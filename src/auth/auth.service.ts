import { Injectable } from '@nestjs/common';
import axios from 'axios';

/*
  Servicio que gestiona las funciones de autenticación.
*/
@Injectable()
export class AuthService {

  /**
   * Obtiene al usuario autenticado mediante el accessToken.
   * @param accessToken - Token de acceso del usuario de Google.
   * @returns Objeto con el usuario logueado.
   */
  async getUserByToken(accessToken: string) {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${accessToken}`,
      );

      const user = response.data;

      return user;

    } catch (error) {
      console.error('Failed to get the user:', error);
    }
  }
}
