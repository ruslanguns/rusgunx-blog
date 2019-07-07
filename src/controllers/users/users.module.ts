import { Module, NestModule, MiddlewareConsumer, RequestMethod, NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSchema } from './schemas/users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from '../../shared/middleware/auth.middleware';
import { AuthService } from '../auth/auth.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import moment = require('moment');
import { extname } from 'path';
import * as path from 'path';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Users', schema: UserSchema },
    ]),
    MulterModule.registerAsync({
      useFactory: () => ({
        storage: diskStorage({
          destination: './files/avatars',
          filename: (req, file, cb) => {
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
            return cb(null, `${randomName}_${moment().format('YYYY-MM-DD')}_${extname(file.originalname)}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          if (ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return cb(new NotFoundException(`Only images are allowed.`), false);
          }
          cb(null, true);
        },
        limits: {
          fileSize: 2000000, // BITS
        },
      }),
    }),
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
        { path: 'users/', method: RequestMethod.GET },
        { path: 'username/:username', method: RequestMethod.GET },
        { path: 'email/:email', method: RequestMethod.GET },
        { path: ':userId', method: RequestMethod.GET },
        { path: 'update/:userId', method: RequestMethod.PATCH },
        { path: 'delete/:userId', method: RequestMethod.DELETE },
      );
  }
}
