import { Repository } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AuthService } from "../auth.service";
import { UserService } from "../../user/user.service";
import axios from "axios";

/*
  Pruebas unitarias para verificar el correcto funcionamiento de los métodos del servicio de autenticación.
*/

// Mock de axios
jest.mock('axios');

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

  });
    
  // ############################## Tests para getUserByToken() ####################################
  describe('getUserByToken', () => {

    it('debería retornar un usuario', async () => {
      const mockAccessToken = 'validAccessToken';
      const mockResponse = {
        data: {
          sub: '12345',
          name: 'John Doe',
          email: 'john.doe@gmail.com',
        },
      };

      // Simula una respuesta exitosa de axios
      (axios.get as jest.Mock).mockResolvedValue(mockResponse);

      const user = await service.getUserByToken(mockAccessToken);

      expect(user).toEqual(mockResponse.data);
    });

    it('debería lanzar un error cuando el token sea inválido', async () => {
      const mockAccessToken = 'invalidAccessToken';
      
      // Simula un error en la llamada a la API
      (axios.get as jest.Mock).mockRejectedValue(new Error('Failed to fetch user'));

      const user = await service.getUserByToken(mockAccessToken);

      expect(user).toBeUndefined();
    });

  });

});
