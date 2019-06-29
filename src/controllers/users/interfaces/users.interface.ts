import { Document } from 'mongoose';

interface Address {
    addr1: string;
    addr2: string;
    city: string;
    state: string;
    country: string;
    zip: string;
}

export interface Users extends Document {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    gender: string;
    birth: Date;
    address: Address;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date;
    deleted: boolean;
    deletedAt: Date;
}
