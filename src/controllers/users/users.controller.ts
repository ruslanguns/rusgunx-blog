import {
    Controller,
    HttpStatus,
    Res,
    Body,
    Post,
    Get,
    Param,
    Patch,
    Delete,
    UseInterceptors,
    UploadedFile,
    NotFoundException,
    Req,
    Next,
    BadGatewayException,
    Query,
    ParseIntPipe,
    UploadedFiles,
} from '@nestjs/common';

import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as moment from 'moment';

import { diskStorage } from 'multer';

import { extname } from 'path';
import * as path from 'path';
import * as sharp from 'sharp';
import * as fs from 'fs';

import { CreateUserDTO } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UserDTO } from './dto/user.dto';
import { ValidateObjectId } from '../../shared/pipes/pipes.index';
import { User } from '../../shared/decorators/user.decorator';
import { QueryDTO } from './dto/query.dto';
import { IResponse } from '../../shared/interfaces/response.interface';
import { ResponseSuccess } from '../../shared/dto/response-success.dto';
import { ResponseError } from '../../shared/dto/response-error.dto';
import { LoggingInterceptor } from '../../shared/interceptors/loggin.interceptor';

@Controller('users')
@UseInterceptors(LoggingInterceptor)
export class UsersController {

    constructor(
        private userService: UsersService,
    ) { }

    @Post('/create')
    async createUser(
        @Body() createUserDTO: CreateUserDTO,
    ): Promise<IResponse> {
        try {
            const item = await this.userService.createUser(createUserDTO);
            return new ResponseSuccess('COMMON.SUCCESS', new UserDTO(item));
        } catch (error) {
            return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
        }
    }

    @Get()
    async getUsers(
    ): Promise<IResponse> {
        try {
            const items = await this.userService.getUsers();
            return new ResponseSuccess('COMMON.SUCCESS', items);
        } catch (error) {
            return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
        }
    }

    @Get('/username/:username')
    async getUserByUsername(
        @Res() res,
        @Param('username') username,
    ) {
        const item = await this.userService.getUserByUsername(username);
        return res.status(HttpStatus.OK).json({
            item,
        });
    }

    @Get('/email/:email')
    async getUserByEmail(
        @Res() res,
        @Param('email') email,
    ) {
        const item = await this.userService.getUserByEmail(email);
        return res.status(HttpStatus.OK).json({
            item,
        });
    }

    @Get('/id/:userId')
    async getUserById(
        @Res() res,
        @Param('userId', new ValidateObjectId()) userId,
    ) {
        const item = await this.userService.getUserById(userId);
        return res.status(HttpStatus.OK).json({
            item,
        });
    }

    @Patch('/update/:userId')
    async updateUser(
        @Res() res,
        @Param('userId', new ValidateObjectId()) userId,
        @Body() userDTO: UserDTO,
    ) {
        const item = await this.userService.updateUser(userId, userDTO);

        return res.status(HttpStatus.OK).json({
            message: 'User updated Successfully',
            item,
        });
    }

    @Delete('/delete/:userId')
    async deleteUser(
        @Res() res,
        @Param('userId', new ValidateObjectId()) userId,
    ) {
        const item = await this.userService.deleteUser(userId);

        return res.status(HttpStatus.OK).json({
            message: 'User has been deleted Successfully',
            deletedAt: item.deletedAt,
        });
    }

    @Post(':userid/avatar')
    @UseInterceptors(FileInterceptor('avatar',
        {
            storage: diskStorage({
                filename: (req, file, cb) => {
                    const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                    return cb(null, `${randomName}_${moment().format('YYYY-MM-DD')}_${extname(file.originalname)}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                const ext = path.extname(file.originalname);
                if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                    return cb(new NotFoundException(`Only images are allowed.`), false);
                }
                cb(null, true);
            },
            limits: {
                fileSize: 2000000, // BITS
            },
        },
    ),
    )
    async uploadAvatar(
        @Res() res,
        @Next() next,
        @Param('userid', new ValidateObjectId()) userId,
        @UploadedFile() avatar,
    ) {
        if (!avatar) {
            throw new NotFoundException(`Missing the upload file in your request.`);
        }

        await sharp(avatar.path).resize(120).toBuffer((err, buf) => {
            if (err) { return next(new BadGatewayException('ERROR: File have not been optimized.')); }
            console.log(avatar.byteLenght);
            avatar = buf;
            console.log(buf.byteLength);

        });
        await this.userService.setAvatar(userId, `${avatar.filename}`);
        return res.status(HttpStatus.OK).json({ message: 'Avatar uploaded' });
    }

    @Post('uploadFile')
    @UseInterceptors(FileInterceptor('image'))
    async uploadFile(
        @UploadedFile() file,

    ): Promise<void> {
        await sharp(file.path)
            // .rotate(180)
            .resize(800)
            .toBuffer()
            .then(data => {
                fs.writeFileSync(file.path, data);
            })
            .catch(err => {
                console.log(err);
            });
        const size = fs.statSync(file.path).size;
        console.log('Resultado: ', Number((size) / 1000000.0), 'Mb');
    }

    @Post('uploadFiles')
    @UseInterceptors(FilesInterceptor('image'))
    async uploadFiles(
        @UploadedFiles() files,
    ): Promise<void> {
        files.map(async item => {
            await sharp(item.path)
                // .rotate(180)
                .resize(800)
                .toBuffer()
                .then(data => {
                    fs.writeFileSync(item.path, data);
                })
                .catch(err => {
                    console.log(err);
                });
            const size = fs.statSync(item.path).size;
            console.log('Antes:', item.size / 1000000.0, 'Resultado: ', Number((size) / 1000000.0), 'Mb');
        });
    }

    @Get('/avatar')
    async serveAvatar(
        @Res() res,
        @Req() req,
        @User('id') userId,
        @Query('userAvatarId') userAvatarId,
    ): Promise<any> {
        const { avatar } = await this.userService.getUserById(userId);

        if (req.query['userAvatarId'] === undefined) { throw new BadGatewayException(`No hay datos`); }

        console.log(req.query['userAvatarId']);

        console.log(userAvatarId);

        // switch (userAvatarId) {
        //     case (userAvatarId !== undefined):
        //         res.sendFile(userAvatarId, { root: 'files/avatars' });
        //         return;
        //     default:
        //         res.sendFile(myAvatarId, { root: 'files/avatars' });
        //         return;
        // }
    }

    @Get('test/optionalQuery')
    async optionalQuery(
        @Query() limit?: number, // expected: optional param
    ): Promise<void> {
        let input = 0;
        if (!limit) {
            console.log(`Limit undefined is: ${input}`); // undefined
        } else {
            input = limit['limit'];
            console.log(`Limit defined is: ${limit}`);
        }
    }

    @Get('test/queryDto')
    async queryDto(
        @Query() query: QueryDTO,
    ) {
        if (!query.limit) {
            console.log(`Limit undefined is: ${query.limit}`); // undefined
        } else {
            console.log(`Limit defined is: ${query.limit}`);
        }
    }

    @Post('test/formatDate')
    async formatDate(
        @Query('date') date: string,
        @Query('dateFormat') dateFormat: string,
    ): Promise<void> {
        const formattedDate = moment(date, dateFormat).toISOString();
        console.log(formattedDate);
    }

    @Get('test/customResponse/:email')
    async customResponse(
        @Param('email') email,
    ): Promise<IResponse> {
        try {
            const user = await this.userService.getUserByEmail(email);
            return new ResponseSuccess('COMMON.SUCCESS', new UserDTO(user));
        } catch (error) {
            return new ResponseError('COMMON.ERROR.GENERIC_ERROR', error);
        }
    }

}
