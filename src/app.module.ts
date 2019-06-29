import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './controllers/users/users.module';
import { PipesModule } from './shared/pipes/pipes.module';
import { PostsModule } from './controllers/posts/posts.module';
import { AuthModule } from './controllers/auth/auth.module';
import { DB_URI } from './shared/config';


@Module({
  imports: [
    MongooseModule.forRoot(DB_URI, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    }),
    AuthModule,
    UsersModule,
    PostsModule,
    PipesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
