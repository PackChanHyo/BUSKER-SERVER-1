import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAuthority } from 'src/commons/role/entity/userAuthority.entity';
import { Repository } from 'typeorm';
import { Artist } from '../artists/entity/artist.entity';
import { BoardAddress } from '../boardAddress/entity/boardAddress.entity';
import { BoardImages } from '../boardImages/entity/boardImages.entity';
import { Category } from '../categories/entities/categories.entity';
import { Comments } from '../comments/entity/comments.entity';

import { Boards } from './entites/boards.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Boards)
    private readonly boardRepository: Repository<Boards>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
    @InjectRepository(BoardAddress)
    private readonly boardAddressRepository: Repository<BoardAddress>,
    @InjectRepository(UserAuthority)
    private readonly userAuthorityRepository: Repository<UserAuthority>,
    @InjectRepository(BoardImages)
    private readonly boardImageRepository: Repository<BoardImages>,
    @InjectRepository(Comments)
    private readonly commentRepository: Repository<Comments>,
  ) {}

  async findAll({ page }) {
    return await this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.category', 'category')
      .leftJoinAndSelect('board.artist', 'artist')
      .leftJoinAndSelect('board.boardAddress', 'boardAddress')
      .leftJoinAndSelect('board.boardImageURL', 'boardImageURL')
      .take(12)
      .skip(page ? (page - 1) * 12 : 0)
      .getMany();
  }

  async findOne({ boardId }) {
    const result = await this.boardRepository.findOne({
      where: {
        id: boardId,
      },
      relations: [
        'category',
        'artist',
        'boardAddress',
        'comments',
        'boardImageURL',
      ],
    });

    if (!result) {
      throw new UnprocessableEntityException('잘못된 조회입니다.');
    }

    return result;
  }

  // 장르별, 카테고리별 지역별  api를 따로 만들거나 압축하기 (제안)
  // const 조건만 적고 if문 작성
  async findSearch({ searchBoardInput, time }) {
    const find = this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.category', 'category')
      .leftJoinAndSelect('board.artist', 'artist')
      .leftJoinAndSelect('board.boardAddress', 'boardAddress')
      .leftJoinAndSelect('board.boardImageURL', 'boardImageURL');

    if (searchBoardInput) {
      find
        .where('category.id IN (:...category)', {
          category: searchBoardInput.category,
        })
        .andWhere('boardAddress.address_district = :district', {
          district: searchBoardInput.district,
        });
    }

    if (searchBoardInput.category && !searchBoardInput.district) {
      find.where('category.id IN (:...category)', {
        category: searchBoardInput.category,
      });
    }

    if (searchBoardInput.district && !searchBoardInput.category) {
      find.where('boardAddress.address_district = :district', {
        district: searchBoardInput.district,
      });
    }

    const result = await find
      .orderBy('board.createAt', 'DESC')
      .take(12)
      .skip(searchBoardInput.page ? (searchBoardInput.page - 1) * 12 : 0)
      .getMany();

    for (let i = 0; i < result.flat().length; i++) {
      if (
        result.flat()[i].start_time < time &&
        result.flat()[i].end_time > time
      ) {
        result.flat()[i].isShowTime = true;
      } else if (result.flat()[i].end_time < time) {
        result.flat()[i].isShowTime = false;
      } else if (result.flat()[i].start_time > time) {
        result.flat()[i].isShowTime = null;
      }
    }

    return result.flat();
  }

  // 기준값 null false것중에 creatat으로 정렬
  // 최근 게시물 3개 보여주기 (시간을 지금 시간 전으로할지? 아니면 총 게시물에서 start 시간으로 정할지 물어보기)
  async findRecent({ artistId, time }) {
    const result = await this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.category', 'category')
      .leftJoinAndSelect('board.artist', 'artist')
      .leftJoinAndSelect('board.boardAddress', 'boardAddress')
      .leftJoinAndSelect('board.boardImageURL', 'boardImageURL')
      .where('artist.id = :artistId', { artistId })
      .andWhere('board.end_time < :time', { time })
      .orderBy('board.createAt', 'DESC')
      .take(3)
      .getMany();

    return result;
  }

  async create({ context, createBoardInput }) {
    const { categoryId, boardImageURL, boardAddressInput, ...boards } =
      createBoardInput;

    const auth = await this.userAuthorityRepository.findOne({
      where: {
        userId: context.req.user.id,
      },
      relations: ['artist'],
    });

    const boardCategory = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
      },
    });

    if (!boardCategory)
      throw new UnprocessableEntityException(
        '잘못된 카테고리 혹은 카테고리가 없습니다.',
      );

    // const start = new Date(createBoardInput.start_time);
    // const end = new Date(createBoardInput.end_time);

    const city = boardAddressInput.address.split(' ')[0];
    const district = `${boardAddressInput.address.split(' ')[0]} ${
      boardAddressInput.address.split(' ')[1]
    }`;

    const boardAddress = await this.boardAddressRepository.save({
      address_city: city,
      address_district: district,
      ...boardAddressInput,
    });

    const result = await this.boardRepository.save({
      title: auth.artist.active_name,
      ...boards,
      category: boardCategory,
      artist: auth.artist,
      boardAddress: boardAddress,
    });

    const temp = [];
    if (createBoardInput.boardImageURL) {
      for (let i = 0; i < boardImageURL.length; i++) {
        const image = await this.boardImageRepository.save({
          url: boardImageURL[i],
          boards: result,
        });
        temp.push(image);
      }
    }
    result.boardImageURL = temp;

    return result;
  }

  async update({ context, boardId, updateBoardInput }) {
    const myBoard = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['category', 'artist', 'boardAddress', 'boardImageURL'],
    });

    if (!myBoard) {
      throw new UnprocessableEntityException('존재하지않는 게시물입니다.');
    }

    const auth = await this.userAuthorityRepository.findOne({
      where: {
        userId: context.req.user.id,
      },
      relations: ['artist'],
    });

    if (auth.artistId !== myBoard.artist.id) {
      throw new UnprocessableEntityException(
        '다른 아티스트의 글은 수정할수없습니다.',
      );
    }

    const myCategory = await this.categoryRepository.findOne({
      where: {
        id: updateBoardInput.categoryId,
      },
    });
    if (!myCategory) {
      throw new UnprocessableEntityException('알수없는 카테고리입니다.');
    }
    // 기존 이미지 삭제
    if (updateBoardInput.boardImageURL) {
      const boardImages = myBoard.boardImageURL;
      for (let i = 0; i < boardImages.length; i++) {
        const boardImageId = boardImages[i].id;
        this.boardImageRepository.delete({
          id: boardImageId,
        });
      }
    }

    if (updateBoardInput.boardAddressInput) {
      const city = updateBoardInput.boardAddressInput.address.split(' ')[0];

      const district = `${
        updateBoardInput.boardAddressInput.address.split(' ')[0]
      } ${updateBoardInput.boardAddressInput.address.split(' ')[1]}`;

      const boardAddress = await this.boardAddressRepository.save({
        id: myBoard.boardAddress.id,
        address_city: city,
        address_district: district,
        ...updateBoardInput.boardAddressInput,
      });

      const result = await this.boardRepository.save({
        ...myBoard,
        id: boardId,
        category: myCategory,
        ...updateBoardInput,
        boardAddress: boardAddress,
      });

      if (updateBoardInput.boardImageURL) {
        const temp = [];
        const newBoardImg = result.boardImageURL;
        for (let i = 0; i < newBoardImg.length; i++) {
          const url = newBoardImg[i];
          const image = await this.boardImageRepository.save({
            url,
            boards: result,
          });
          temp.push(image);
        }
        result.boardImageURL = temp;
      }

      return result;
    } else {
      const result = await this.boardRepository.save({
        ...myBoard,
        id: boardId,
        category: myCategory,
        ...updateBoardInput,
        boardAddress: myBoard.boardAddress,
      });

      if (updateBoardInput.boardImageURL) {
        const temp = [];
        const newBoardImg = result.boardImageURL;
        for (let i = 0; i < newBoardImg.length; i++) {
          const url = newBoardImg[i];
          const image = await this.boardImageRepository.save({
            url,
            boards: result,
          });
          temp.push(image);
        }
        result.boardImageURL = temp;
      }

      return result;
    }
  }

  // 이미지 댓글 지우고 cascade 하고 보드 지우기
  async delete({ boardId }) {
    await this.boardImageRepository.delete({
      boards: {
        id: boardId,
      },
    });

    await this.commentRepository.delete({
      board: {
        id: boardId,
      },
    });

    const board = await this.boardRepository.findOne({
      where: {
        id: boardId,
      },
      relations: ['boardAddress'],
    });

    const result = await this.boardRepository.delete({ id: boardId });

    await this.boardAddressRepository.delete({
      id: board.boardAddress.id,
    });
    return result.affected ? true : false;
  }
}
