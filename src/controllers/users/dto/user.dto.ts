
export class UserDTO {

    constructor(object: any) {
        this.firstName = object.firstName;
        this.lastName = object.lastName;
        this.username = object.username;
        this.email = object.email;
        this.phone = object.phone;
        this.role = object.role;
        this.gender = object.gender;
        this.address = object.address;
        this.avatar = object.avatar;
    }

    readonly username: string;
    readonly password: string;
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly phone: string;
    readonly role: string;
    readonly gender: string;
    readonly address: {};
    birth: string;
    readonly avatar: string;
}
