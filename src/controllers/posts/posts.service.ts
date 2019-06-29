import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Posts } from './interfaces/posts.interface';
import { CreatePostDTO } from './dto/create-post.dto';
@Injectable()
export class PostsService {

    constructor(
        @InjectModel('Posts') private readonly postModel: Model<Posts>,
    ) { }

    async createPost(dto: CreatePostDTO, id: string): Promise<Posts> {

        if (!id) { throw new BadRequestException(`You are not allowed`); }
        dto.authorId = id;

        const NEW_POST = await new this.postModel(dto);
        const post: Posts = await NEW_POST.save()
            .catch(error => { throw new BadRequestException(error); });
        throw new HttpException({ message: 'Post created.', post }, HttpStatus.CREATED);
    }

    async getPosts(): Promise<Posts[]> {
        const POSTS = await this.postModel.find();
        return POSTS;
    }

}
