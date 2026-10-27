import { Injectable, inject } from '@angular/core';
import { ApiGateway } from '../shared/api-gateway';

export interface BookDto {
  id: string;
  name: string;
  author: string;
  ownerId?: string;
}

interface BookAddDto {
  status: string;
}

@Injectable({ providedIn: 'root' })
export class BooksRepository {
  private readonly httpGateway = inject(ApiGateway);

  async getBooks(): Promise<BookDto[]> {
    const booksDto = await this.httpGateway.get<BookDto[]>('/');
    return booksDto;
  }

  async addBook({ name, author }: { name: string; author: string }): Promise<boolean> {
    const bookAddDto = await this.httpGateway.post<BookAddDto>('/', { name, author });
    return bookAddDto && bookAddDto.status === 'ok' ? true : false;
  }
}
