import { All } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';
import { Artist } from 'src/apis/artists/entity/artist.entity';
import { BoardAddress } from 'src/apis/boardAddress/entity/boardAddress.entity';
import { BoardImages } from 'src/apis/boardImages/entity/boardImages.entity';
import { Category } from 'src/apis/categories/entities/categories.entity';
import { Comments } from 'src/apis/comments/entity/comments.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Boards {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  title: string;

  @Column()
  @Field(() => String)
  contents: string;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  start_time: Date;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  end_time: Date;

  @Column({ nullable: true })
  @Field(() => Boolean, { nullable: true })
  isShowTime: boolean;

  @CreateDateColumn()
  @Field(() => Date)
  createAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;

  @ManyToOne(() => Category)
  @Field(() => Category)
  category: Category;

  @ManyToOne(() => Artist)
  @Field(() => Artist)
  artist: Artist;

  @JoinColumn()
  @OneToOne(() => BoardAddress)
  @Field(() => BoardAddress)
  boardAddress: BoardAddress;

  @JoinColumn()
  @OneToMany(() => BoardImages, (boardImageURL) => boardImageURL.boards, {
    cascade: ['remove', 'update'],
  })
  @Field(() => [BoardImages])
  boardImageURL: [BoardImages];

  @JoinColumn()
  @OneToMany(() => Comments, (comments) => comments.board, {
    cascade: ['remove', 'update'],
  })
  @Field(() => [Comments])
  comments: Comments[];
}
