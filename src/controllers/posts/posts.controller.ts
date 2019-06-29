import { Controller, Get, Res, HttpStatus, Post, Body } from '@nestjs/common';
import { CreatePostDTO } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { User } from '../../shared/decorators/user.decorator';

@Controller('posts')
export class PostsController {

    constructor(
        private postService: PostsService,
    ) { }

    @Get()
    async getPosts(@Res() res) {
        const post = await this.postService.getPosts();

        return res.status(HttpStatus.OK).json({
            post,
        });
    }

    @Post()
    async createPost(
        @User('id') id: string,
        @Body() createPostDto: CreatePostDTO,
    ) {
        console.log(id);
        return await this.postService.createPost(createPostDto, id);
    }
}
