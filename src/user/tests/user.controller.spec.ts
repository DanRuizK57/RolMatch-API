
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { NotFoundException } from '@nestjs/common';

/*
  Pruebas de integración para verificar el correcto funcionamiento del módulo de usuarios.
*/

describe('UserController', () => {
    let controller: UserController;
    let service: UserService;
    let userRepository: Repository<User>;

    const mockedUsers = [
        { id: 1, firstName: 'John', lastName: "Doe", email: 'john.doe@example.com', picture: '', reports: 0 } as User,
        { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '', reports: 0 } as User
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        service = module.get<UserService>(UserService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    // ############################## Tests para create() ####################################################
    describe('POST /users', () => {
        it('debería crear un usuario', async () => {
            const createUserDto: CreateUserDto = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                picture: '',
            };

            const expectedUser = {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                picture: '',
            } as User;

            jest.spyOn(service, 'create').mockResolvedValue(expectedUser);

            const result = await controller.create(createUserDto);

            expect(service.create).toHaveBeenCalledWith(createUserDto);
            expect(result).toEqual(expectedUser);  

        });

    });

    // ############################## Tests para findAll() ####################################################
    describe('GET /users', () => {

        it('debería retornar una lista de usuarios', async () => { 
            jest.spyOn(service, 'findAll').mockResolvedValue(mockedUsers);

            const result = await controller.findAll();

            expect(result).toEqual([
                { id: 1, firstName: 'John', lastName: "Doe", email: 'john.doe@example.com', picture: '', reports: 0 },
                { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '', reports: 0 },
            ]);
        });

    });

    // ############################## Tests para findOne() ####################################################
    describe('GET /users/:id', () => {

        it('debería retornar un usuario', async () => { 

            const userId = "1";

            jest.spyOn(service, 'findOne').mockResolvedValue(mockedUsers[0]);

            const result = await controller.findOne(userId);

            expect(result).toEqual(
                { id: 1, firstName: 'John', lastName: "Doe", email: 'john.doe@example.com', picture: '', reports: 0 },
            );
        });

    });

    // ############################## Tests para report() ####################################################
    describe('PATCH /users/report/:id', () => {
    it('debería reportar a un usuario', async () => {
            const userId = 2;
          
            const reportedUser = { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '', reports: 1 } as User;

            jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockedUsers[1]);
            jest.spyOn(userRepository, 'save').mockResolvedValueOnce(mockedUsers[1]);

            // Ejecutar la función
            const result = await controller.report(userId.toString());

            // Comprobar que el usuario reportado tenga un reporte
            expect(result.reports).toBe(reportedUser.reports);
            expect(userRepository.save).toHaveBeenCalledWith(reportedUser);
    });
        
    it('debería lanzar NotFoundException si el usuario no es encontrado', async () => {
    const userId = 111;

    // Mockear findOne para que devuelva undefined
    jest.spyOn(service, 'findOne').mockResolvedValue(undefined);

    // Ejecutar la función y verificar la excepción
    await expect(controller.report(userId.toString())).rejects.toThrow(NotFoundException);
    });
});

});
