import { Document } from 'mongoose';

interface Tags {
    name: string;
    createdAt: Date;
}

interface Categories {
    name: string;
    createdAt: Date;
}

interface Comments {
    authorId: string;
    content: string;
    approved: boolean;
    visibility: string;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    deletedAt: Date;
}

export interface Posts extends Document {
    title: string;
    content: string;
    authorId: string;
    tags: Tags[];
    categories: Categories[];
    commentStatus: boolean;
    comments: Comments[];
    visibility: string;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    deletedAt: Date;
}
