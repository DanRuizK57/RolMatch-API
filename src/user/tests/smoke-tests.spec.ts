import request from 'supertest';
import { INestApplication, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

/*
  Pruebas de humo para verificar el correcto funcionamiento del módulo de usuarios.
*/

describe('Pruebas de humo para el módulo de usuario', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    
    await app.init();
  });

  it('debería crear un usuario correctamente', async () => {
    // Mock del repositorio para asegurar que no existe un usuario con el mismo email
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    const userDto = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      picture: 'http://example.com/picture.jpg'
    };

    const response = await request(app.getHttpServer())
      .post('/user')
      .send(userDto)
      .expect(201);

    expect(response.body.email).toBe(userDto.email);
  });

  afterAll(async () => {
    await app.close();
  });
});
