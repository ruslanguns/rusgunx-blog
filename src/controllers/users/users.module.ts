import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSchema } from './schemas/users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from '../../shared/middleware/auth.middleware';
import { AuthService } from '../auth/auth.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Users', schema: UserSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService],
  exports: [UsersService],
})

// export class UsersModule { }
export class UsersModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'user', method: RequestMethod.GET },
        { path: 'username/:username', method: RequestMethod.GET },
        { path: 'email/:email', method: RequestMethod.GET },
        { path: ':userId', method: RequestMethod.GET },
        { path: 'update/:userId', method: RequestMethod.PATCH },
        { path: 'delete/:userId', method: RequestMethod.DELETE },
      );
  }
}
