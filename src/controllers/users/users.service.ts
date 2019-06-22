import { Injectable, BadRequestException, HttpStatus, HttpException, Res, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users } from './interfaces/users.interface';
import { CreateUserDTO } from './dto/create-user.dto';
import { validate } from 'class-validator';
import { UserDTO } from './dto/user.dto';

@Injectable()
export class UsersService {

    constructor(
        @InjectModel('Users') private readonly userModel: Model<Users>,
    ) { }

    async createUser(dto: CreateUserDTO): Promise<Users> {
        const USER_EXIST = await this.userModel.findOne({ $and: [{ deleted: false }, { $or: [{ username: dto.username }, { email: dto.email }] }] });
        if (USER_EXIST) { throw new BadRequestException(`User already exists.`); }

        const ERRORS = await validate(dto);
        if (ERRORS.length > 0) {
            const _ERROR = { username: 'User input is not valid.' };
            throw new HttpException({ message: 'Input data validation failed', _ERROR }, HttpStatus.BAD_REQUEST);
        } else {
            const USER_CREATED = new this.userModel(dto);
            const item: Users = await USER_CREATED.save()
                .catch(error => { throw new BadRequestException(error); });
            item.password = undefined;
            return item;
        }
    }

    async getUsers(): Promise<Users[]> {
        const USERS: Users[] = await this.userModel.find({ deleted: false })
            .catch(error => { throw new BadRequestException(error); });
        for (const user of USERS) {
            user.password = undefined;
        }
        return USERS;
    }

    async getUserById(userId: string): Promise<Users> {
        const USER: Users = await this.userModel.findOne({ $and: [{ _id: userId }, { deleted: false }] })
            .catch(error => { throw new BadRequestException(error); });
        USER.password = undefined;
        return USER;
    }

    async getUserByUsername(username: string): Promise<Users> {
        const USER: Users = await this.userModel.findOne({ $and: [{ username }, { deleted: false }] })
            .catch(error => { throw new BadRequestException(error); });
        USER.password = undefined;
        return USER;
    }

    async getUserByEmail(email: string): Promise<Users> {
        const USER: Users = await this.userModel.findOne({ $and: [{ email }, { deleted: false }] })
            .catch(error => { throw new BadRequestException(error); });
        USER.password = undefined;
        return USER;
    }

    async updateUser(userId: string, dto: UserDTO): Promise<Users> {
        const user: Users = await this.getUserById(userId);
        if (user) {
            const UPDATED_USER: Users = await this.userModel.findByIdAndUpdate(userId, dto, { new: true, runValidators: true })
                .catch(error => { throw new BadRequestException(error); });
            UPDATED_USER.password = undefined;
            return UPDATED_USER;
        } else {
            throw new NotFoundException(`User with ID: ${userId} does not exists.`);
        }
    }

    async deleteUser(userId: string): Promise<Users> {
        const user: Users = await this.getUserById(userId);
        if (user) {
            const USER_DELETED = await this.userModel.findByIdAndUpdate(userId, { $set: { deleted: true, deletedAt: new Date() } }, { new: true })
                .catch(error => { throw new BadRequestException(error); });
            return USER_DELETED;
        } else {
            throw new NotFoundException(`User with ID: ${userId} does not exists.`);
        }
    }
}
