import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from '../admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

/*
  Pruebas unitarias para verificar el correcto funcionamiento de los métodos del servicio de administración.
*/
describe('AdminService', () => {
  let service: AdminService;
  let usersRepository: Repository<User>;

  const mockedUsers = [
    { id: 1, email: 'admin@gmail.com', role: 'admin' } as User,
    { id: 2, email: 'user@gmail.com', role: 'user' } as User,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  // ############################## Tests para isUserAnAdmin() ######################################
  describe('isUserAnAdmin', () => {

    it('debería retornar false si no se encontró el usuario', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      const result = await service.isUserAnAdmin('noexiste@gmail.com');

      expect(result).toBe(false);
    });

    it('debería retornar true si el rol del usuario es "admin"', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockedUsers[0]);

      const result = await service.isUserAnAdmin('admin@gmail.com');

      expect(result).toBe(true);
    });

    it('debería retornar false si el rol del usuario no es "admin"', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockedUsers[1]);

      const result = await service.isUserAnAdmin('user@gmail.com');

      expect(result).toBe(false);
    });
    
  });

  // ############################## Tests para remove() ######################################
  describe('remove', () => {

    it('debería eliminar a un usuario', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockedUsers[1]);
      jest.spyOn(usersRepository, 'remove').mockResolvedValue(mockedUsers[1]);

      const result = await service.remove(mockedUsers[1].id);

      expect(result).toEqual(mockedUsers[1]);
    });

    it('debería lanzar NotFoundException si no se encontró al usuario', async () => {

      const userId = 778;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      expect(service.remove(userId)).rejects.toThrow(
        new NotFoundException(`User with the ID ${userId} not found!`),
      );
    });

    it('debería lanzar UnauthorizedException si el usuario a eliminar es un admin', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockedUsers[0]);

      expect(service.remove(mockedUsers[0].id)).rejects.toThrow(
        new UnauthorizedException(`You can´t remove admins!`),
      );
    });

   });

  // ############################## Tests para findAllReported() ######################################
  describe('findAllReported', () => {

    it('debería retornar todos los usuarios reportados', async () => {
      const mockReportedUsers = [
        { id: 1, reports: 5 },
        { id: 2, reports: 3 },
        { id: 3, reports: 1 },
      ] as User[];

      jest.spyOn(usersRepository, 'find').mockResolvedValue(mockReportedUsers);

      const result = await service.findAllReported(1);

      expect(result).toEqual(mockReportedUsers);
    });

    it('debería retornar una lista vacía si no hay usuarios reportados', async () => {
      jest.spyOn(usersRepository, 'find').mockResolvedValue([]);

      const result = await service.findAllReported(1);

      expect(result).toEqual([]);
    });

  });
  
  // ############################## Tests para removeReports() ######################################
  describe('removeReports', () => {

    it('debería restablecer los reportes de un usuario', async () => {
      const mockReportedUser = { id: 1, reports: 5 } as User;
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockReportedUser);
      jest.spyOn(usersRepository, 'save').mockResolvedValue({ ...mockReportedUser, reports: 0 });

      const result = await service.removeReports(mockReportedUser.id);

      expect(result).toEqual({ ...mockReportedUser, reports: 0 });
    });

    it('debería lanzar NotFoundException si no se encontró al usuario', async () => {

      const userId = 657;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      expect(service.removeReports(userId)).rejects.toThrow(
        new NotFoundException(`User with the ID ${userId} not found!`),
      );
    });

   });
  
});
