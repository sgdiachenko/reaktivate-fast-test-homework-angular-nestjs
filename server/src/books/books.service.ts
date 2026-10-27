import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { Book } from './book.schema.js';

export interface BookDto {
  id: string;
  name: string;
  author: string;
  ownerId?: string;
}

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private readonly books: Model<Book>) {}

  // Shared books plus the books added by this user.
  findAll(user: string): Promise<BookDto[]> {
    return this.find({ ownerId: { $in: [null, user] } });
  }

  findPrivate(user: string): Promise<BookDto[]> {
    return this.find({ ownerId: user });
  }

  async add(user: string, { name, author }: Pick<Book, 'name' | 'author'>): Promise<void> {
    await this.books.create({ name, author, ownerId: user });
  }

  async reset(user: string): Promise<void> {
    await this.books.deleteMany({ ownerId: user });
  }

  private async find(filter: QueryFilter<Book>): Promise<BookDto[]> {
    const books = await this.books.find(filter).sort({ _id: 1 }).lean();
    return books.map(({ _id, name, author, ownerId }) => ({
      id: _id.toString(),
      name,
      author,
      ...(ownerId && { ownerId }),
    }));
  }
}
