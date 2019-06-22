import { MinLength, MaxLength, IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateUserDTO {
    @MinLength(3)
    @MaxLength(20)
    readonly username: string;

    @IsString()
    @MinLength(5)
    readonly password: string;

    @IsString()
    @IsOptional()
    readonly firstName?: string;

    @IsString()
    @IsOptional()
    readonly lastName?: string;

    @IsEmail()
    readonly email: string;

    @IsString()
    @IsOptional()
    readonly phone?: string;

    @IsString()
    @IsOptional()
    readonly sex?: string;
}
