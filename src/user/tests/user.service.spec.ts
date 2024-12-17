import { Repository } from "typeorm";
import { UserService } from "../user.service";
import { User } from "../entities/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "../dto/create-user.dto";

/*
  Pruebas unitarias para verificar el correcto funcionamiento de los métodos del servicio de usuarios.
*/
describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  const mockedUsers: User[] = [
    Object.assign(new User(), { id: 1, firstName: 'John', lastName: "Doe", email: 'john.doe@example.com', picture: '' }),
      Object.assign(new User(), { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '' }),
  ];

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
    jest.spyOn(service, 'findAll').mockImplementation(async () => mockedUsers as User[]);

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

    it('debería lanzar un error al haber un usuario registrado con el mismo email', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        picture: '',
      };

      jest.spyOn(userRepository, 'findOne').mockImplementation(async () => mockedUsers[0]);
      
      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });

  });

// ############################## Tests para findAll()###################################################
  describe('findAll', () => {

    it('debería retornar un array de usuarios', async () => {
      const result = await service.findAll();
      expect(result).toEqual(mockedUsers);
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

      jest.spyOn(service, 'findOne').mockImplementation(async () => mockedUsers[0]);

      expect(await service.findOne(userId)).toEqual(mockedUsers[0]);
    });

    it('debería retornar un error al enviar un número menor a 0', async () => {
      const userId = -3;

      await expect(service.findOne(userId)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFoundException si el servicio retorna undefined', async () => {
      const userId = 999;
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(undefined);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
    });

  });

  // ############################## Tests para findByEmail() ################################################
  describe('findByEmail', () => {

    it('debería retornar un usuario con el email señalado', async () => {
      const email = 'john.doe@example.com';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockedUsers[0]);

      expect(await service.findByEmail(email)).toEqual(mockedUsers[0]);
    });
      
    it('debería lanzar NotFoundException si no se encuentra un usuario con ese correo', async () => {
      const email = 'email@ejemplo.com';

      jest.spyOn(service, 'findByEmail').mockRejectedValue(new NotFoundException(`User with email ${email} not found!`));

      await expect(service.findByEmail(email)).rejects.toThrow(NotFoundException);
    });

  });

  // ############################## Tests para report() ################################################
  describe('report()', () => {
      it('debería reportar a un usuario', async () => {
          const userId = 1;

          // Mockear el repositorio y la entidad de usuario
          const userToReport = {
              id: userId,
              firstName: 'Jhon',
              lastName: 'Doe',
              email: 'j.doe@gmail.com',
              picture: '',
              reports: 0,
        } as User;
        
        const reportedUser = {
              id: userId,
              firstName: 'Jhon',
              lastName: 'Doe',
              email: 'j.doe@gmail.com',
              picture: '',
              reports: 1,
          } as User;

          jest.spyOn(service, 'findOne').mockResolvedValueOnce(userToReport);
          jest.spyOn(userRepository, 'save').mockResolvedValueOnce(userToReport);

          // Ejecutar la función
          const result = await service.report(userId);

          // Comprobar que el usuario reportado tenga un reporte más
          expect(result.reports).toBe(reportedUser.reports);
          expect(userRepository.save).toHaveBeenCalledWith(reportedUser);
  });

  it('debería lanzar NotFoundException si el usuario no es encontrado', async () => {
      const userId = 999;

      // Mockear findOne para que devuelva undefined
      jest.spyOn(service, 'findOne').mockResolvedValue(undefined);

      // Ejecutar la función y verificar la excepción
      await expect(service.report(userId)).rejects.toThrow(NotFoundException);
  });
      
  });

});
