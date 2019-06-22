import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './controllers/users/users.module';
import { PipesModule } from './shared/pipes/pipes.module';
import { PostsModule } from './controllers/posts/posts.module';

// Mongoose

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/rusgunx-blog', {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    }),
    UsersModule,
    PipesModule,
    PostsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
