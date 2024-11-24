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

/*
  Pruebas de integración para verificar el correcto funcionamiento del módulo de administración.
*/
describe('AdminController', () => {
    let controller: AdminController;
    let service: AdminService;
    let userService: UserService;
    let gameService: GameService;

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

});
