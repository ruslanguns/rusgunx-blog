
export class CreatePostDTO {
    title: string;
    content: string;
    authorId: string;
    tags: [];
    categories: [];
    commentStatus: boolean;
    comments: [];
    visibility: boolean;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
}
