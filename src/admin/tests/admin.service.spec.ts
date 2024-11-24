import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from '../admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';

describe('AdminService', () => {
  let service: AdminService;
  let usersRepository: Repository<User>;

  const mockedUsers = [
    { email: 'admin@gmail.com', role: 'admin' } as User,
    { email: 'user@gmail.com', role: 'user' } as User,
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

});
