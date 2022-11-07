import { Field, ObjectType } from '@nestjs/graphql';
import { Artist } from 'src/apis/artists/entity/artist.entity';
import { BoardAddress } from 'src/apis/boardAddress/entity/boardAddress.entity';
import { Category } from 'src/apis/categories/entities/categories.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
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

  @Column()
  @Field(() => Date)
  start_time: Date;

  @Column()
  @Field(() => Date)
  end_time: Date;

  @Column()
  @Field(() => Date, { nullable: false })
  day: Date;

  @Column({ default: false })
  @Field(() => Boolean)
  isShowTime: boolean;

  @CreateDateColumn()
  @Field(() => Date)
  createAt: Date;

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
}
