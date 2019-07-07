import { Injectable, BadRequestException, HttpStatus, HttpException, Res, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users } from './interfaces/users.interface';
import { CreateUserDTO } from './dto/create-user.dto';
import { validate, Validator } from 'class-validator';
import { UserDTO } from './dto/user.dto';
import * as moment from 'moment';

@Injectable()
export class UsersService {

    validator = new Validator();

    constructor(
        @InjectModel('Users') private readonly userModel: Model<Users>,
    ) { }

    /**
     * Create User
     * -----------------
     * * Check if user exist before creating it.
     * * Validate if there are errors
     * * Create the user and unset password from response
     * Receives the new user body in x-wwww-form-urlencoded format.
     * @param dto object
     */
    async createUser(dto: CreateUserDTO): Promise<Users> {

        const USER_EXIST = await this.userModel.findOne({ $and: [{ deleted: false }, { $or: [{ username: dto.username }, { email: dto.email }] }] });
        if (USER_EXIST) { throw new BadRequestException(`User already exists.`); }

        const date = (dto.birth as string).split(':')[0];
        const format = (dto.birth as string).split(':')[1];
        const formattedDate = await this.toDate(date, format);
        dto.birth = formattedDate;

        const ERRORS = await validate(dto);
        if (ERRORS.length > 0) {
            const _ERROR = { username: 'User input is not valid.' };
            throw new HttpException({ message: 'Input data validation failed', _ERROR }, HttpStatus.BAD_REQUEST);
        } else {
            const USER_CREATED = new this.userModel(dto);
            const user: Users = await USER_CREATED.save()
                .catch(error => { throw new BadRequestException(error); });
            user.password = undefined;
            return user;
        }
    }

    /**
     * Get users
     * ------------
     * This method gets all the users which are actived.
     */
    async getUsers(): Promise<Users[]> {
        const USERS: Users[] = await this.userModel.find({ deleted: false })
            .catch(error => { throw new BadRequestException(error); });
        USERS.map(user => user.password = undefined);
        return USERS;
    }

    /**
     * Get user by Id
     * ---------------
     * Find the user and unset the passwork from response.
     * Receives the ID in ObjectID format and does ID validation.
     * @param userId string
     */
    async getUserById(userId: string): Promise<Users> {
        const USER: Users = await this.userModel.findOne({ $and: [{ _id: userId }, { deleted: false }] })
            .catch(error => { throw new BadRequestException(error); });
        if (!USER) { throw new NotFoundException(`User with ID: ${userId} does not exist.`); }
        USER.password = undefined;
        return USER;
    }

    /**
     * Get user by Username
     * ---------------
     * Find the user and unset the passwork from response..
     * @param username string
     */
    async getUserByUsername(username: string): Promise<Users> {
        const USER: Users = await this.userModel.findOne({ $and: [{ username }, { deleted: false }] })
            .catch(error => { throw new BadRequestException(error); });

        if (!USER) { throw new NotFoundException(`User with Username: ${username} does not exist.`); }
        USER.password = undefined;
        return USER;
    }

    /**
     * Get user by email
     * ---------------
     * Find the user and unset the passwork from response.
     * Receives the ID in ObjectID format and does ID validation.
     * @param email string
     */
    async getUserByEmail(email: string): Promise<Users> {
        if (!this.validator.isEmail(email)) { throw new BadRequestException(`Email wrong format.`); }

        const USER: Users = await this.userModel.findOne({ $and: [{ email }, { deleted: false }] })
            .catch(error => { throw new BadRequestException(error); });
        if (!USER) { throw new NotFoundException(`User with Email: ${email} does not exist.`); }
        USER.password = undefined;
        return USER;
    }

    /**
     * Get user by ID and updates it.
     * --------------------------
     * Creates an user and validates the incomming forms.
     * @param userId string
     * @param dto Object
     */
    async updateUser(userId: string, dto: UserDTO): Promise<Users> {
        const user: Users = await this.getUserById(userId);
        if (user) {

            if (dto.birth !== undefined) {
                const date = (dto.birth as string).split(':')[0];
                const format = (dto.birth as string).split(':')[1];
                const formattedDate = await this.toDate(date, format);
                if (!formattedDate) { throw new BadRequestException(`Date format is wrong.`); }
                dto.birth = formattedDate;
            }

            const UPDATED_USER: Users = await this.userModel.findByIdAndUpdate(userId, dto, { new: true, runValidators: true })
                .catch(error => { throw new BadRequestException(error); });
            UPDATED_USER.password = undefined;
            return UPDATED_USER;
        } else {
            throw new NotFoundException(`User with ID: ${userId} does not exists.`);
        }
    }

    /**
     * Delete an user by id
     * --------------------
     * This does not deletes from the database only patch the deleted field to true and creates the deletion date.
     * @param userId string
     */
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

    async findOne(options: object): Promise<Users> {
        return await this.userModel.findOne(options);
    }

    async setAvatar(userId: string, avatarUrl: string) {
        const user: Users = await this.getUserById(userId);
        if (user) {
            const UPDATED_USER: Users = await this.userModel.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true, runValidators: true })
                .catch(error => { throw new BadRequestException(error); });
            UPDATED_USER.password = undefined;
            return UPDATED_USER;
        } else {
            throw new NotFoundException(`User with ID: ${userId} does not exists.`);
        }
    }

    private async toDate(date: string, dateFormat: string): Promise<string> {
        const formattedDate = await moment(date, dateFormat).toISOString();
        return formattedDate;
    }

}
