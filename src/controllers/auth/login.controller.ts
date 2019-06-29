import { Controller, Post, Res, Body, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login-user.dto';

@Controller('login')
export class LoginController {

    constructor(private authService: AuthService) { }

    @Post()
    async userLogin(
        @Body() loginUserDTO: LoginUserDTO,
    ) {
        return await this.authService.login(loginUserDTO);
    }
}
