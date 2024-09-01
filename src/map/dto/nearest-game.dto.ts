import { IsInt, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'src/game/enums/type.enum';

/*
  Clase que representa los valores obligatorios que se deben obtener para buscar la partida más cercana.
*/
export class NearestGameDto {

    @IsInt()
    id: number;

    @IsEnum(Type)
    type: Type;

    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;
}