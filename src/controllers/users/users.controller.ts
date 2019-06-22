import { Controller, HttpStatus, Res, Body, Post, Get, Put, NotFoundException, Param, Query, Patch, Delete } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UserDTO } from './dto/user.dto';
import { ValidateObjectId } from '../../shared/pipes/pipes.index';

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
}
