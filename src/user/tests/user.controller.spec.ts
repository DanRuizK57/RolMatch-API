
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';

/*
  Pruebas de integración para verificar el correcto funcionamiento del módulo de usuarios.
*/

describe('UserController', () => {
    let controller: UserController;
    let service: UserService;

    const mockedUsers = [
        { id: 1, firstName: 'John', lastName: "Doe", email: 'john.doe@example.com', picture: '' } as User,
        { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' } as User
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
                { id: 1, firstName: 'John', lastName: "Doe", email: 'john.doe@example.com', picture: '' },
                { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' },
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
                { id: 1, firstName: 'John', lastName: "Doe", email: 'john.doe@example.com', picture: '' },
            );
        });

    });
});
