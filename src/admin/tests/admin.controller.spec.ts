import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../admin.controller';
import { AdminService } from '../admin.service';
import { UserService } from '../../user/user.service';
import { GameService } from '../../game/game.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Game } from '../../game/entities/game.entity';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Player } from '../../game/entities/player.entity';
import { NotFoundException } from '@nestjs/common';

/*
  Pruebas de integración para verificar el correcto funcionamiento del módulo de administración.
*/
describe('AdminController', () => {
    let controller: AdminController;
    let service: AdminService;
    let userService: UserService;
    let gameService: GameService;
    let usersRepository: Repository<User>;

    const mockUser = { id: 123 } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
        providers: [
            AdminService,
            GameService,
                UserService,
                {
                    provide: getRepositoryToken(Game),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Player),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
        ],
    }).compile();

      controller = module.get<AdminController>(AdminController);
      service = module.get<AdminService>(AdminService);
      userService = module.get<UserService>(UserService);
      gameService = module.get<GameService>(GameService);
      usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });
    
  // ############################## Tests para findAllReported() ######################################
  describe('findAllReported', () => {

    it('debería retornar todos los usuarios reportados', async () => {
        const mockReports = [
        { id: 1, reports: 5 } as User,
        { id: 2, reports: 3 } as User,
        ];
        jest.spyOn(service, 'findAllReported').mockResolvedValue(mockReports);

        const result = await controller.findAllReported('1');

        expect(result).toEqual(mockReports);
    });

    it('debería retornar una lista vacía al no existir usuarios reportados', async () => {
        jest.spyOn(service, 'findAllReported').mockResolvedValue([]);

        const reportedUsers = await controller.findAllReported('42');

        expect(reportedUsers).toEqual([]);
    });

  });
    
  // ############################## Tests para removeReports() ######################################
  describe('removeReports', () => {

      it('debería restablecer los reportes de un usuario', async () => {
        const mockReportedUser = { id: 1, reports: 5 } as User;
        jest.spyOn(service, 'removeReports').mockResolvedValue({ ...mockReportedUser, reports: 0 });

        const result = await controller.removeReports(mockReportedUser.id.toString());

        expect(result).toEqual({ ...mockReportedUser, reports: 0 });
    });

    it('debería lanzar NotFoundException si no se encontró al usuario', async () => {

      const userId = 345;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      expect(controller.removeReports(userId.toString())).rejects.toThrow(
        new NotFoundException(`User with the ID ${userId} not found!`),
      );
    });

  });
    
    // ############################## Tests para remove() ######################################
  describe('remove', () => {

      it('debería eliminar un usuario exitosamente', async () => {
        const userId = '123';
        const mockUser = { id: 123 } as User;

        jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(gameService, 'leaveAllGames').mockResolvedValue(undefined);
        jest.spyOn(gameService, 'removeAllGamesFromUser').mockResolvedValue(undefined);
        jest.spyOn(service, 'remove').mockResolvedValue(mockUser);

        const result = await controller.remove(userId);

        expect(userService.findOne).toHaveBeenCalledWith(+userId);
        expect(gameService.leaveAllGames).toHaveBeenCalledWith(mockUser);
        expect(gameService.removeAllGamesFromUser).toHaveBeenCalledWith(mockUser);
        expect(result).toEqual(mockUser);
    });

   });

});
