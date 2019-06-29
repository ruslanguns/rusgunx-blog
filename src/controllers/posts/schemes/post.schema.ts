import { Schema } from 'mongoose';

// Enums
const VISIBILITY = {
    values: ['public', 'draft', 'private'],
    message: '\'{VALUE}\' is not an allowed option.',
};

// recursive embedded-document schema
const categories = new Schema();
const tags = new Schema();
const comments = new Schema();

categories.add({
    name: { type: String, required: false },
    createdAt: { type: Date, required: false, default: Date.now },
});

tags.add({
    name: { type: String, required: false },
    createdAt: { type: Date, required: false, default: Date.now },
});

comments.add({
    authorId: { type: Schema.Types.ObjectId, ref: 'Users' },
    content: { type: String, required: true },
    approved: { type: Date, default: false },
    visibility: { type: String, default: 'draft', enum: VISIBILITY },
    createdAt: { type: Date, required: false },
    updatedAt: { type: Date, required: false },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, required: false, default: null },
});

export const PostSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'Users' },
    tags: [tags],
    categories: [categories],
    commentStatus: { type: Boolean, default: true },
    comments: [comments],
    visibility: { type: String, default: 'draft', enum: VISIBILITY },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
});

PostSchema.pre('save', async function save(next) {
    const post = this as any;
    if (!post.isModified('tags')) { return next(); }

    try {
        post.tags.createdAt = await new Date();
    } catch (err) {
        return next(err);
    }
});
