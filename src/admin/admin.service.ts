import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { MoreThan, Repository } from 'typeorm';

/*
    Servicio que gestiona las funciones de administración.
*/
@Injectable()
export class AdminService {

     /*
        Constructor que instancia el repositorio de usuarios.
    */
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>
    ) { }

    /**
     * Valida que un usuario es un administrador.
     * @param email - Correo electrónico del usuario a validar.
     * @returns Valor booleano. Si es 'true' el usuario es administrador, de lo contrario es un usuario común.
     */
    async isUserAnAdmin(email: string): Promise<boolean> {
        
        const user = await this.usersRepository.findOne({ where: { email } });

        if (!user) return false;

        return user.role == "admin" ? true : false;
    }

    /**
     * Elimina a un usuario por su id.
     * @param id - Identificador del usuario a eliminar.
     * @returns Usuario eliminado.
     */
    async remove(id: number) {
        const userToRemove = await this.usersRepository.findOne({ where: { id } });

        if (userToRemove.role == "admin") throw new UnauthorizedException('You can´t remove admins!')
        
        if (!userToRemove) throw new NotFoundException();
    
        return await this.usersRepository.remove(userToRemove);
    }

    /**
     * Busca todos los usuarios reportados almacenados en la base de datos.
     * @returns Lista de todos los usuarios reportados.
    */
    async findAllReported(id: number) {
        //! Se añade un id como parámetro, ya que solo así funciona. Solución referenciada en ReadMe.
        return await this.usersRepository.find({
        where: {
            reports: MoreThan(0),
        },
        order: {
            reports: 'DESC',
        },
        });
    }

    /**
     * Elimina los reportes de un usuario por su id.
     * @param id - Identificador del usuario de los reportes a eliminar.
     * @returns Usuario sin reportes.
    */
    async removeReports(id: number) {
        const userToRemoveReports = await this.usersRepository.findOne({ where: { id } });

        if (!userToRemoveReports) throw new NotFoundException();

        userToRemoveReports.reports = 0;

        return await this.usersRepository.save(userToRemoveReports);;
    }

}
