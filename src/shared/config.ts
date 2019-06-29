import * as crypto from 'crypto';

export const HOST = `http://${process.env.HOST}`;
export const PORT = process.env.SERVER_PORT || 3000;
export const SERVER_URL = `${HOST}:${PORT}`;
export const SECRET = sha1(process.env.JWT_SECRET);
export const DB_URI = `${process.env.MONGO_URI}${process.env.DB_NAME}`;

function sha1(data: string) {
    return crypto.createHash('sha1').digest('hex');
}
