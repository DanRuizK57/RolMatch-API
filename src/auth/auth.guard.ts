import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';

/*
  Guardián encargado de verificar que la persona que quiera ingresar a una URL protegida
  esté autenticado y registrado en la base de datos del sistema.
*/
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

  /*
    Constructor que instancia los servicios de autenticación y usuarios.
  */
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {
    super();
  }
  
   /**
   * Obtiene la petición del usuario, verifica que está autenticado y continua al destino preestablecido.
   * @param context - Datos del contexto de la petición.
   * @returns Valor booleano que indica si lleva al usuario a la URL solicitada o rechaza la petición.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Se obtiene la petición mediante el contexto
    const request = context.switchToHttp().getRequest();

    // Se verifica que exista un accessToken
    if (!request.headers.authorization) {
      throw new UnauthorizedException('Access token not found');
    }

    // Extraer el accessToken del encabezado de autorización
    const accessToken = request.headers.authorization.split(' ')[1];
    
    // Validar usuario
    const frontUser = await this.authService.getUserByToken(accessToken);

    // Validar que usuario esté en la base de datos
    const databaseUser = await this.userService.findByEmail(frontUser.data.email);

    // Si el usuario no se encuentra en la base de datos, rechza la petición
    if (!databaseUser) {
      throw new UnauthorizedException('Error: User is not in the database!');
    }

    return true;
  }
}

