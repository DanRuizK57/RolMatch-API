import * as request from 'supertest';
import { INestApplication, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user.service';

/*
  Pruebas de humo para verificar el correcto funcionamiento del módulo de usuarios.
*/

describe('Pruebas de humo para el módulo de usuario', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let userService: UserService;

  const mockedUsers = [
        // Se asignan de esta manera para que los detecte como User y no como Object
        Object.assign(new User(), { id: 1, firstName: 'John', lastName: "Doe", email: 'john.doe@example.com', picture: '', reports: 0 }),
        Object.assign(new User(), { id: 2, firstName: 'Jane', lastName: "Doe", email: 'jane.doe@example.com', picture: '', reports: 0 }),
    ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    userService = moduleFixture.get<UserService>(UserService);
    
    await app.init();
  });

  // Prueba para create()
  it('POST /users', async () => {
    // Mock del repositorio para asegurar que no existe un usuario con el mismo email
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    const userDto = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      picture: 'http://example.com/picture.jpg'
    };

    const expectedUser = {
        id: 1,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        picture: 'http://example.com/picture.jpg',
    } as User;

    jest.spyOn(userService, 'create').mockResolvedValue(expectedUser);

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(userDto)
      .expect(201);

    expect(response.body.email).toBe(expectedUser.email);
  });

  // Prueba para findAll()
  it('GET /users', async () => {

    jest.spyOn(userRepository, 'find').mockResolvedValue(mockedUsers);

    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(response.body).toEqual(mockedUsers); // Verifica que la respuesta sea igual a mockUsers
    expect(response.body.length).toBe(2); // Verifica que hay dos usuarios
  });

  afterAll(async () => {
    await userRepository.query('DELETE FROM "users" WHERE "email" = $1', ['test@example.com']);
    await app.close();
  });
});
