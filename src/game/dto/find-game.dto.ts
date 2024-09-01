import { IsInt, IsEnum } from 'class-validator';
import { Type } from '../enums/type.enum';

export class FindGameDto {

    @IsInt()
    id: number;

    @IsEnum(Type)
    type: Type;

}