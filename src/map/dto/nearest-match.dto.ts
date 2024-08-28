import { IsInt, IsNumber, IsEnum } from 'class-validator';
import { Sport } from '../../match/enums/sport.enum';

/*
  Clase que representa los valores obligatorios que se deben obtener para buscar el partido más cercano.
*/
export class NearestMatchDto {

    @IsInt()
    id: number;

    @IsEnum(Sport)
    sport: Sport;

    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;
}