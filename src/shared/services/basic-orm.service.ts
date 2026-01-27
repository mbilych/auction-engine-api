import { DeepPartial, Repository } from 'typeorm';
import { PickProperty } from '../types/pick-property.type';

export class BasicOrmService<Entity> {
  constructor(protected repository: Repository<Entity>) {}

  createQueryBuilder: PickProperty<Repository<Entity>, 'createQueryBuilder'> =
    this.repository.createQueryBuilder.bind(this.repository);
  createEntity: PickProperty<Repository<Entity>, 'create'> =
    this.repository.create.bind(this.repository);
  save: PickProperty<Repository<Entity>, 'save'> = this.repository.save.bind(
    this.repository,
  );
  upsertEntity: PickProperty<Repository<Entity>, 'upsert'> =
    this.repository.upsert.bind(this.repository);
  findOne: PickProperty<Repository<Entity>, 'findOne'> =
    this.repository.findOne.bind(this.repository);
  findOneBy: PickProperty<Repository<Entity>, 'findOneBy'> =
    this.repository.findOneBy.bind(this.repository);
  find: PickProperty<Repository<Entity>, 'find'> = this.repository.find.bind(
    this.repository,
  );
  findBy: PickProperty<Repository<Entity>, 'findBy'> =
    this.repository.findBy.bind(this.repository);
  findAndUpdate: PickProperty<Repository<Entity>, 'update'> =
    this.repository.update.bind(this.repository);
  merge: PickProperty<Repository<Entity>, 'merge'> = this.repository.merge.bind(
    this.repository,
  );
  delete: PickProperty<Repository<Entity>, 'delete'> =
    this.repository.delete.bind(this.repository);
  remove: PickProperty<Repository<Entity>, 'remove'> =
    this.repository.remove.bind(this.repository);
  softRemove: PickProperty<Repository<Entity>, 'softRemove'> =
    this.repository.softRemove.bind(this.repository);
  count: PickProperty<Repository<Entity>, 'count'> = this.repository.count.bind(
    this.repository,
  );
  countBy: PickProperty<Repository<Entity>, 'countBy'> =
    this.repository.countBy.bind(this.repository);
  query: PickProperty<Repository<Entity>, 'query'> = this.repository.query.bind(
    this.repository,
  );

  create(data: DeepPartial<Entity>): Promise<Entity> {
    return this.repository.save(this.repository.create(data));
  }
  async update(data: DeepPartial<Entity>) {
    return this.repository.save(await this.repository.preload(data));
  }
}
