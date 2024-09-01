import { IsString, IsInt, IsNumber, IsEnum, Min, MinLength, MaxLength } from 'class-validator';
import { Type } from '../enums/type.enum';

/*
  Clase que representa los valores obligatorios que se deben obtener para crear un partido.
*/
export class CreateGameDto {

  @MinLength(3)
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  duration: string;

  @MinLength(9)
  @MaxLength(10)
  @IsString()
  date: string;

  @MinLength(4)
  @MaxLength(5)
  @IsString()
  hour: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @Min(1)
  @IsInt()
  playerSlots: number;

  @Min(2)
  @IsInt()
  totalPlayers: number;

  @IsEnum(Type)
  sport: Type;
}