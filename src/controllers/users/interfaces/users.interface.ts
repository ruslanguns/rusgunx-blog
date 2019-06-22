import { Document } from 'mongoose';

export interface Users extends Document {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    phone: string;
    sex: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date;
    deleted: boolean;
    deletedAt: Date;
}
