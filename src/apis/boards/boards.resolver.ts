import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/gql-auth.guard';
import { Roles } from 'src/commons/role/roles.decorator';
import { RolesGuard } from 'src/commons/role/roles.guard';
import { RoleType } from 'src/commons/role/type/role-type';

import { BoardsService } from './boards.service';
import { CreateBoardInput } from './dto/createBoard.input';
import { UpdateBoardInput } from './dto/updateBoard.input';
import { Boards } from './entites/boards.entity';

@Resolver()
export class BoardsResolver {
  constructor(private readonly boardsService: BoardsService) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Boards)
  async fetchBoard(
    @Args('boardId') boardId: string, //
  ) {
    return await this.boardsService.findOne({ boardId });
  }

  // Args 카테고리 구역 으로 바꾸기
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Boards])
  async fetchBoardsBySearch(
    @Args({ name: 'page', type: () => Int, nullable: true })
    page: number,
    @Args({ name: 'categoryId', type: () => [String], nullable: true })
    categoryId: string[],
    @Args({ name: 'districtId', nullable: true }) districtId: string,
  ) {
    const result = await this.boardsService.findSearch({
      page,
      categoryId,
      districtId,
    });
    return result;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Boards])
  async fetchRecentBoards(@Args('artistId') artistId: string) {
    return await this.boardsService.findRecent({ artistId });
  }

  @Roles(RoleType.ARTIST)
  @UseGuards(GqlAuthAccessGuard, RolesGuard)
  @Mutation(() => Boards)
  async createBoards(
    @Args({ name: 'createBoardInput', nullable: true })
    createBoardInput: CreateBoardInput,
    @Context() context: any,
  ) {
    const result = await this.boardsService.create({
      context,
      createBoardInput,
    });
    return result;
  }

  @Roles(RoleType.ARTIST)
  @UseGuards(RolesGuard)
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boards)
  async updateBoard(
    @Args('boardId') boardId: string,
    @Args('updateBoardInput') updateBoardInput: UpdateBoardInput,
    @Context() context: any,
  ) {
    return await this.boardsService.update({
      context,
      boardId,
      updateBoardInput,
    });
  }

  @Roles(RoleType.ARTIST)
  @UseGuards(GqlAuthAccessGuard, RolesGuard)
  @Mutation(() => Boolean)
  async deleteBoard(@Args('boardId') boardId: string) {
    return await this.boardsService.delete({ boardId });
  }
}
