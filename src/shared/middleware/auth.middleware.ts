import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { NestMiddleware, HttpStatus, Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { SECRET } from '../config';
import { AuthService } from '../../controllers/auth/auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {

    time = new Date().getTime() / 1000;

    constructor(private readonly authService: AuthService) { }

    async use(req: any, res: Response, next: NextFunction) {
        const authHeaders = req.headers.authorization;
        if (authHeaders && (authHeaders as string).split(' ')[1]) {
            const token = (authHeaders as string).split(' ')[1];
            const decoded: any = jwt.verify(token, SECRET);
            const user = await this.authService.findById(decoded.id);

            if (!user) {
                throw new HttpException('User not found.', HttpStatus.UNAUTHORIZED);
            }

            req.user = user;
            next();

        } else {
            throw new HttpException('Not authorized.', HttpStatus.UNAUTHORIZED);
        }
    }
}
