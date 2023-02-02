import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/gql-auth.guard';
import { CommentsService } from './comment.service';
import { CreateCommentInput } from './dto/createComment.input';
import { Comments } from './entity/comments.entity';

@Resolver()
export class CommentsResolver {
  constructor(private readonly commentService: CommentsService) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Comments])
  async fetchComments(@Args('boardId') boardId: string) {
    return await this.commentService.findBycommentAll({ boardId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Comments)
  async fetchByComment(
    @Args('commentId') commentId: string, //
  ) {
    return await this.commentService.findByComment({ commentId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Comments)
  async createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput, //
    @Context() context: any,
  ) {
    return await this.commentService.create({ context, createCommentInput });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Comments)
  async updateComment(
    @Args('commentId') commentId: string,
    @Args('content') content: string,
    @Context() context: any,
  ) {
    return await this.commentService.update({ context, commentId, content });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async deleteComment(
    @Args('commentId') commentId: string,
    @Context() context: any,
  ) {
    return await this.commentService.delete({ context, commentId });
  }
}
