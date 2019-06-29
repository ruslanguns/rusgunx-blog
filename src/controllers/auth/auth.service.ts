import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { SECRET } from '../../shared/config';
import { LoginUserDTO } from './dto/login-user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
    ) { }

    async login(loginUserDto: LoginUserDTO) {
        const _USER = await this.findOne(loginUserDto);

        const errors = { User: 'Not found' };

        if (!_USER) { throw new HttpException({ message: 'Authentication failed.', errors }, HttpStatus.NOT_FOUND); }

        const token = await this.generateJWT(_USER);

        const { firstName, username, email } = _USER;
        const user = { firstName, username, token, email };

        throw new HttpException({ message: 'Authentication success.', user }, HttpStatus.OK);
    }

    async findOne(loginUserDto: LoginUserDTO) {
        const findOneOptions = {
            $and: [{ deleted: false }, {
                $or: [
                    {
                        email: loginUserDto.email,
                        password: crypto.createHmac('sha256', loginUserDto.password).digest('hex'),
                    },
                    {
                        username: loginUserDto.username,
                        password: crypto.createHmac('sha256', loginUserDto.password).digest('hex'),
                    },
                ],
            }],
        };

        return await this.usersService.finfOne(findOneOptions);
    }

    public generateJWT(user) {
        const today = new Date();
        const exp = new Date(today);

        exp.setMinutes(today.getMinutes() + 10); // Minutos
        exp.setHours(today.getHours() + 0); // Horas
        exp.setDate(today.getDate() + 0); // Dias
        exp.setMonth(today.getMonth() + 0); // Meses

        return jwt.sign({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            exp: exp.getTime() / 1000,
        }, SECRET);
    }

    async findById(userId: string) {
        const USER = await this.usersService.getUserById(userId);
        return await this.buildUserRO(USER);
    }

    private async buildUserRO(user: any) {
        const userRO = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: await this.generateJWT(user),
        };
        return { ...userRO };
    }
}
