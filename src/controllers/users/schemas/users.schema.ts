import { Schema } from 'mongoose';
import * as uniqueValidator from 'mongoose-unique-validator';
import * as crypto from 'crypto';
import moment = require('moment');

const ROLES_VALIDOS = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '\'{VALUE}\' is not a allowed role.',
};
const GENDER = {
    values: ['man', 'woman', 'no_defined'],
    message: '\'{VALUE}\' is not an allowed option.',
};

export const UserSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    firstName: String,
    lastName: String,
    phone: String,
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: ROLES_VALIDOS,
    },
    gender: {
        type: String,
        default: 'no_defined',
        enum: GENDER,
    },
    birth: {
        type: Date,
        required: true,
    },
    address: {
        addr1: String,
        addr2: String,
        city: String,
        state: String,
        country: String,
        zip: Number,
    },
    avatar: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: Date,
    lastLoginAt: Date,
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date,
}, { strict: 'throw' });

/**
 * Middleware que está a la escucha de la función 'save' en el UserSchema
 * la idea es que antes que guarde, se formatee la contraseña con el hash.
 */
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

/**
 * Este es un middleware que se ejecuta *DESPUÉS* de ejecutar la funcion: 'findOneAndUpdate'
 * por cada actualización que sufre el modelo de UserSchema, realiza una actualización al campo
 * 'updatedAt' y cuando es modificada la contraseña la formatea con el hash.
 */
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
