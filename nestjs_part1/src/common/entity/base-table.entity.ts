import { CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

export abstract class BaseTableEntity {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;
}
