import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from './entity/artist.entity';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
  ) {}

  async findOneWithActiveName({ active_name }) {
    return await this.artistRepository.findOne({ where: { active_name } });
  }

  async create({
    active_name,
    description,
    promotion_url,
    category,
    artistImageURL,
  }) {
    return await this.artistRepository.save({
      active_name,
      description,
      promotion_url,
      category,
      artistImageURL,
    });
  }

  async findOne({ artistId }) {
    return await this.artistRepository.findOne({
      where: { id: artistId },
      relations: ['category'],
    });
  }

  async update({ artistId, updateArtistInput }) {
    const artist = await this.artistRepository.findOne({
      where: { id: artistId },
    });
    const result = await this.artistRepository.save({
      ...artist,
      ...updateArtistInput,
    });
    return result;
  }

  async delete({ artistId }) {
    const result = await this.artistRepository.delete({ id: artistId });
    return result.affected ? true : false;
  }
}
