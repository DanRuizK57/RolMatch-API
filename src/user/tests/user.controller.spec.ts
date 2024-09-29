
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

/*
  Pruebas de integración para verificar el correcto funcionamiento del módulo de usuarios.
*/

describe('UserController', () => {
    let controller: UserController;
    let service: UserService;
    let userRepository: Repository<User>;

    const mockedUsers = [
        // Se asignan de esta manera para que los detecte como User y no como Object
        Object.assign(new User(), { id: 1, firstName: 'John', lastName: "Doe", email: 'john.doe@example.com', picture: '', reports: 0 }),
        Object.assign(new User(), { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '', reports: 0 }),
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

        jest.spyOn(service, 'findAll').mockResolvedValue(mockedUsers);
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

        it('debería lanzar un error al haber un usuario registrado con el mismo email', async () => {
            const createUserDto: CreateUserDto = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                picture: '',
            };

            jest.spyOn(userRepository, 'findOne').mockImplementation(async () =>
                Object.assign(new User(), { id: 1, firstName: 'John', lastName: "Doe", email: 'john.doe@example.com', picture: '' })
            );
            
            await expect(controller.create(createUserDto)).rejects.toThrow(BadRequestException);
        });

    });

    // ############################## Tests para findAll() ####################################################
    describe('GET /users', () => {

        it('debería retornar una lista de usuarios', async () => { 

            const result = await controller.findAll();

            expect(result).toEqual([
                Object.assign(new User(), { id: 1, firstName: 'John', lastName: "Doe", email: 'john.doe@example.com', picture: '', reports: 0 }),
                Object.assign(new User(), { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '', reports: 0 }),
            ]);
        });

        it('hay 2 elementos en el array', async () => {
            const result = await controller.findAll();
            expect(result).toHaveLength(2);
        });

        it('todos los elementos de la lista deben ser instancias de User', async () => {
            const result = await controller.findAll();
            result.forEach(user => {
                expect(user).toBeInstanceOf(User);
            });
        });
        
        it('debería retornar un array vacío si no hay usuarios', async () => {
            jest.spyOn(service, 'findAll').mockResolvedValueOnce([]);
            const result = await controller.findAll();
            expect(result).toEqual([]);
        });

        it('debería llamar a userService.findAll una sola vez', async () => {
            await controller.findAll();
            expect(service.findAll).toHaveBeenCalledTimes(1);
        });

    });

    // ############################## Tests para findOne() ####################################################
    describe('GET /users/:id', () => {

        it('debería retornar un usuario', async () => { 

            const userId = 1;

            jest.spyOn(service, 'findOne').mockResolvedValue(mockedUsers[0]);

            const result = await controller.findOne(userId.toString());

            expect(result).toEqual(
                Object.assign(new User(), { id: 1, firstName: 'John', lastName: "Doe", email: 'john.doe@example.com', picture: '', reports: 0 }),
            );
        });

        it('debería retornar un error al enviar un número menor a 1', async () => {
            const userId = -3;

            // Mock para que 'findOne' retorne una excepción
            jest.spyOn(service, 'findOne').mockRejectedValue(new BadRequestException('ID must be greather than 0!'));

            await expect(controller.findOne(userId.toString())).rejects.toThrow(BadRequestException);
        });

        it('debería retornar un error al enviar una letra', async () => {
            const userId = "a";

            // Mock para que 'findOne' retorne una excepción
            jest.spyOn(service, 'findOne').mockRejectedValue(new BadRequestException('ID must be a number!'));

            await expect(controller.findOne(userId)).rejects.toThrow(BadRequestException);
        });

        it('debería lanzar NotFoundException si el servicio retorna undefined', async () => {
            const userId = 111;
            jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException(`User with ID ${userId} not found!`));

            await expect(controller.findOne(userId.toString())).rejects.toThrow(NotFoundException);
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
