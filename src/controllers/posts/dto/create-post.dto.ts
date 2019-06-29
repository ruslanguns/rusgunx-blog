
export class CreatePostDTO {
    title: string;
    content: string;
    authorId: string;
    tags: string[];
    categories: string[];
    commentStatus: boolean;
    visibility: string;
}
