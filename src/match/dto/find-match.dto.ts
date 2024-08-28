import { IsInt, IsEnum, Min } from 'class-validator';
import { Sport } from '../enums/sport.enum';

export class FindMatchDto {

    @IsInt()
    id: number;


    @IsEnum(Sport)
    sport: Sport;

}