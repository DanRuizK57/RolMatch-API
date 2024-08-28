# stime-api-user
API de usuarios de la aplicación SportTime realizado con el framework NestJS.

## Instalación

```bash
$ npm install
```

## Iniciar la app

```bash
# Desarrollo
$ npm run start

# Desarrollo - Cambios en tiempo real
$ npm run start:dev
```

## Variables de entorno

### Inicio de sesión con Google

**GOOGLE_CLIENT_ID:** ID del cliente de Google.

**GOOGLE_CLIENT_SECRET:** Secreto del cliente de Google.

Para obtener las variables de entorno relacionadas con Google, se debe entrar al siguiente link: https://console.cloud.google.com/

Luego, se debe crear un proyecto y habilitar las credenciales.

### Base de datos PostgreSQL

**POSTGRESQL_HOST:** Dirección de la base de datos (localhost en caso de ser local).

**POSTGRESQL_PORT:** Puerto a conectarse (por defecto 5432).

**POSTGRESQL_USERNAME:** Nombre de usuario PostgreSQL.

**POSTGRESQL_PASSWORD:** Contraseña del usuario.

**POSTGRESQL_DB_NAME:** Nombre de la base de datos.

## Referencias:
Documentación Passport: https://www.passportjs.org/tutorials/google/