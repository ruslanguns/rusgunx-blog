import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginController } from './login.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [LoginController],
  providers: [AuthService, UsersModule],
  exports: [AuthService],
})

export class AuthModule { }
