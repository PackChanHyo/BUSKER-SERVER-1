import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Boards } from '../boards/entites/boards.entity';
import { User } from '../users/entity/user.entity';
import { Comments } from './entity/comments.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comments)
    private readonly commentRepository: Repository<Comments>,
    @InjectRepository(Boards)
    private readonly boardsRepository: Repository<Boards>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findBycommentAll({ boardId }) {
    return await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.board', 'board')
      .where('board.id = :boardId', { boardId })
      .orderBy('comment.createAt', 'DESC')
      .getMany();
  }

  async findByComment({ commentId }) {
    return await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user', 'board'],
    });
  }

  async create({ context, createCommentInput }) {
    const board = await this.boardsRepository.findOne({
      where: {
        id: createCommentInput.boardId,
      },
      relations: ['artist', 'boardImageURL'],
    });
    const user = await this.userRepository.findOne({
      where: { id: context.req.user.id },
      relations: ['userImageURL'],
    });

    const result = await this.commentRepository.save({
      ...createCommentInput,
      user,
      board,
    });

    return result;
  }

  async update({ context, commentId, content }) {
    const myComment = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
      relations: ['user', 'board'],
    });

    if (myComment.user.id !== context.req.user.id) {
      throw new UnprocessableEntityException('내가 쓴 댓글만 수정가능합니다.');
    }
    const result = await this.commentRepository.save({
      ...myComment,
      id: commentId,
      content,
    });

    return result;
  }

  async delete({ context, commentId }) {
    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
      relations: ['user'],
    });

    if (comment.user.id !== context.req.user.id) {
      throw new UnprocessableEntityException('내가 쓴 댓글만 삭제 가능합니다.');
    }
    const result = await this.commentRepository.delete({ id: commentId });
    return result.affected ? true : false;
  }
}
