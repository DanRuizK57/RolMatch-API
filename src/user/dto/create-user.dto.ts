import { IsEmail, IsString } from "class-validator";

/*
  Clase que representa los valores obligatorios que se deben obtener para crear un usuario.
*/
export class CreateUserDto {

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEmail()
    email: string;

    @IsString()
    picture: string;
}
