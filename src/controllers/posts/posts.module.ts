import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { AuthMiddleware } from '../../shared/middleware/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './schemes/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Posts', schema: PostSchema },
    ]),
    AuthModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})

export class PostsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(PostsController);
  }
}
