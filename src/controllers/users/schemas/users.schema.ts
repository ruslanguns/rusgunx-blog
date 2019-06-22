import { Schema } from 'mongoose';
import * as uniqueValidator from 'mongoose-unique-validator';

import * as crypto from 'crypto';

// TODO: No me esta validando
const ROLES_VALIDOS = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} No es un role permitido.',
};
const SEX = {
    values: ['man', 'woman', 'no_defined'],
    message: '\'{VALUE}\' No es una opción permitida.',
};

export const UserSchema = new Schema({
    username: {
        type: String,
        // unique: true,
        unique: false,
        required: [
            true,
            'Username is required',
        ],
    },
    password: {
        type: String,
        required: [
            true,
            'Password is required',
        ],
    },
    firstName: {
        type: String,
        required: false,
        default: '',
    },
    lastName: {
        type: String,
        required: false,
        default: '',
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: ROLES_VALIDOS,
    },
    email: {
        type: String,
        // unique: true,
        unique: false,
        required: [
            true,
            'Email is required',
        ],
    },
    phone: {
        type: String,
        required: false,
        default: '',
    },
    sex: {
        type: String,
        required: false,
        default: 'no_defined',
        enum: SEX,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        required: false,
        default: null,
    },
    lastLoginAt: {
        type: Date,
        required: false,
        default: null,
    },
    deleted: {
        type: Boolean,
        required: false,
        default: false,
    },
    deletedAt: {
        type: Date,
        required: false,
        default: null,
    },
}, { strict: 'throw' });

UserSchema.pre('save', async function save(next) {
    const user = this as any; // evitar error tslint ts(2339)
    if (!user.isModified('password')) { return next(); }
    try {
        user.password = await crypto.createHmac('sha256', user.password).digest('hex');
        return next();
    } catch (err) {
        return next(err);
    }
});

UserSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    update.updatedAt = await new Date();
    if (update.password) {
        update.password = await crypto.createHmac('sha256', update.password).digest('hex');
        next();
    } else {
        next();
    }
    next();
});

UserSchema.plugin(uniqueValidator, { message: 'El campo {PATH} debe ser único' });
