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
    HttpCode,
    NotFoundException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as dayjs from 'dayjs';
import { extname } from 'path';
import * as path from 'path';

import { CreateUserDTO } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UserDTO } from './dto/user.dto';
import { ValidateObjectId } from '../../shared/pipes/pipes.index';
import { SERVER_URL } from '../../shared/config';

@Controller('users')
export class UsersController {

    constructor(
        private userService: UsersService,
    ) { }

    @Post('/create')
    async createUser(
        @Res() res,
        @Body() createUserDTO: CreateUserDTO,
    ) {
        const item = await this.userService.createUser(createUserDTO);
        return res.status(HttpStatus.CREATED).json({
            message: 'User created',
            item,
        });
    }

    @Get()
    async getUsers(
        @Res() res,
    ) {
        const items = await this.userService.getUsers();
        return res.status(HttpStatus.OK).json({
            items,
        });
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

    @Get('/:userId')
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
                destination: './files/avatars',
                filename: (req, file, cb) => {

                    const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                    return cb(null, `${randomName}_${dayjs().format('YYYY-MM-DD')}_${extname(file.originalname)}`);
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
                fileSize: 2000000,
            },
        },
    ),
    )
    async uploadAvatar(
        @Res() res,
        @Param('userid', new ValidateObjectId()) userId,
        @UploadedFile() avatar,
    ) {
        if (!avatar) {
            throw new NotFoundException(`Missing the upload file in your request.`);
        }
        await this.userService.setAvatar(userId, `${SERVER_URL}/users/avatar/${avatar.filename}`);
        return res.status(HttpStatus.OK).json({
            message: 'Avatar uploaded',
            file_size: avatar.size,
            file_destination: avatar.destination,
        });
    }

    @Get('avatar/:fileId')
    async serveAvatar(
        @Res() res,
        @Param('fileId') fileId,
    ): Promise<any> {
        res.sendFile(fileId, { root: 'files/avatars' })
    }
}
