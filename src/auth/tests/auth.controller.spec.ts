import { Repository } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AuthService } from "../auth.service";
import { UserService } from "../../user/user.service";
import { AuthController } from "../auth.controller";
import { Response } from 'express';
import * as request from 'supertest';

/*
  Pruebas de integración para verificar el correcto funcionamiento del módulo de autenticación.
*/
describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let userService: UserService;
  let res: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    res = {} as Response;

  });
    
  // ############################## Tests para callback() ####################################
  describe('callback', () => {

    it('debería retornar un usuario ya existente', async () => {
      const accessToken = 'validToken';
      const mockGoogleUser = {
        given_name: 'John',
        family_name: 'Doe',
        email: 'john.doe@gmail.com',
        picture: 'http://example.com/picture.jpg',
      };

      const mockDatabaseUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@gmail.com',
        picture: 'http://example.com/picture.jpg',
      } as User;

      jest.spyOn(service, 'getUserByToken').mockResolvedValue(mockGoogleUser);
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockDatabaseUser);
      jest.spyOn(userService, 'create').mockResolvedValue(mockDatabaseUser);

      const req = {
        headers: {
          authorization: accessToken,
        },
      };

      // Simular respuesta
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn().mockReturnThis();

      await controller.callback(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDatabaseUser);
    });

    it('debería retornar un usuario que no existe en la base de datos', async () => {
      const accessToken = 'validToken';
      const mockGoogleUser = {
        given_name: 'Jane',
        family_name: 'Doe',
        email: 'jane.doe@gmail.com',
        picture: 'http://example.com/picture.jpg',
      };

      const mockUserToSave = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@gmail.com',
        picture: 'http://example.com/picture.jpg',
      };

      const mockDatabaseUser = {
        id: 2,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@gmail.com',
        picture: 'http://example.com/picture.jpg',
       } as User;

      jest.spyOn(service, 'getUserByToken').mockResolvedValue(mockGoogleUser);
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue(mockDatabaseUser);
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockDatabaseUser);

      const req = {
        headers: {
          authorization: accessToken,
        },
      };

      // Simular respuesta
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn().mockReturnThis();

      await controller.callback(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDatabaseUser);
    });

  });

});
