import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/gql-auth.guard';
import { Roles } from 'src/commons/role/roles.decorator';
import { RolesGuard } from 'src/commons/role/roles.guard';
import { RoleType } from 'src/commons/role/type/role-type';

import { BoardsService } from './boards.service';
import { CreateBoardInput } from './dto/createBoard.input';
import { SearchBoardInput } from './dto/searchBoard.inpust';
import { UpdateBoardInput } from './dto/updateBoard.input';
import { Boards } from './entites/boards.entity';

@Resolver()
export class BoardsResolver {
  constructor(private readonly boardsService: BoardsService) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Boards])
  async fetchBoards(
    @Args('page') page: number, //
  ) {
    return await this.boardsService.findAll({ page });
  }

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
    @Args({ name: 'searchBoardInput', nullable: true })
    searchBoardInput: SearchBoardInput,
    @Args('time') time: Date,
  ) {
    const result = await this.boardsService.findSearch({
      searchBoardInput,
      time,
    });
    return result;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Boards])
  async fetchRecentBoards(
    @Args('artistId') artistId: string,
    @Args('time') time: Date,
  ) {
    return await this.boardsService.findRecent({ artistId, time });
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
