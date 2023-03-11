import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
  @Field(() => String, { nullable: true })
  nickname: string;

  @Field(() => String, { nullable: true })
  userImageURL: string;
}
