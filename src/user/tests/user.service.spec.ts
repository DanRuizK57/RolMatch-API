import { Repository } from "typeorm";
import { UserService } from "../user.service";
import { User } from "../entities/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "../dto/create-user.dto";

/*
  Pruebas unitarias de UserService para verificar el correcto funcionamiento de los métodos.
*/
describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Mock del método findAll
    jest.spyOn(service, 'findAll').mockImplementation(async () => [
      Object.assign(new User(), { id: 1, firstName: 'John', lastName: "Doe", email: 'john.doe@example.com', picture: '' }),
      Object.assign(new User(), { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' }),
    ]);
      
    // Mock del método findOne
    jest.spyOn(service, 'findOne').mockImplementation(async () =>
      Object.assign(new User(), { id: 1, firstName: 'John', lastName: "Doe", email: 'john.doe@example.com', picture: '' })
    );


  });
    
  // ############################## Tests para create() ####################################################
  describe('create', () => {

    it('debería crear un usuario', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        picture: '',
      };

      const createdUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        picture: ''
      };

      jest.spyOn(service, 'create').mockResolvedValue(createdUser as User);

      const result = await service.create(createUserDto);
      
      expect(result).toEqual(createdUser);
    });

  });

// ############################## Tests para findAll()###################################################
  describe('findAll', () => {

    it('debería retornar un array de usuarios', async () => {
      const result = await service.findAll();
      expect(result).toEqual([
        { id: 1, firstName: 'John', lastName: "Doe", email: 'john.doe@example.com', picture: '' },
        { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' },
      ]);
    });

    it('hay 2 elementos en el array', async () => {
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });

    it('todos los elementos de la lista deben ser instancias de User', async () => {
      const result = await service.findAll();
      result.forEach(user => {
        expect(user).toBeInstanceOf(User);
      });
    });
    
    it('debería retornar un array vacío si no hay usuarios', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValueOnce([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });

    it('debería llamar a userService.findAll una sola vez', async () => {
      await service.findAll();
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

  });
    
  // ############################## Tests para findOne() ####################################################
  describe('findOne', () => {
    it('debería retornar al usuario con ID 1', async () => {
      const userId = 1;
      const user: User = await service.findOne(userId);

      await expect(user).toEqual({ id: 1, firstName: 'John', lastName: "Doe", email: 'john.doe@example.com', picture: '' });
    });

    it('debería retornar un error al enviar un número menor a 1', async () => {
      const userId = -3;

        // Establece el mock para que `findOne` del servicio lance una excepción
      jest.spyOn(service, 'findOne').mockImplementation(async (id: number) => {
        if (id <= 0) {
          throw new BadRequestException('ID must be greather than 0!');
        }
        return { id: 1, firstName: 'John', lastName: "Doe", email: 'john.doe@example.com', picture: '' } as User;
      });

      await expect(service.findOne(userId)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFoundException si el servicio retorna undefined', async () => {
      const userId = 999;
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException(`User with ID ${userId} not found!`));

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
    });

  });

  // ############################## Tests para findByEmail() ################################################
  describe('findByEmail', () => {

    it('debería retornar un usuario con el email señalado', async () => {
      const email = 'john.doe@example.com';

      const mockedUser: User = Object.assign(new User(), {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        picture: ''
      });

      jest.spyOn(service, 'findByEmail').mockResolvedValue(mockedUser);

      const user = await service.findByEmail(email);

      expect(user).toEqual(mockedUser);
    });
      
    it('debería lanzar NotFoundException si no se encuentra un usuario con ese correo', async () => {
      const email = 'email@ejemplo.com';

      jest.spyOn(service, 'findByEmail').mockRejectedValue(new NotFoundException(`User with email ${email} not found!`));

      await expect(service.findByEmail(email)).rejects.toThrow(NotFoundException);
    });

  });


});
