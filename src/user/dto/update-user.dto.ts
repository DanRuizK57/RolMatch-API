import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/*
  Clase que representa los valores obligatorios que se deben obtener para actualizar un usuario.
*/

export class UpdateUserDto extends PartialType(CreateUserDto) {}
