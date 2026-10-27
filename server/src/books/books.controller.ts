import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BookDto, BooksService } from './books.service.js';

interface StatusDto {
  status: 'ok';
}

const isFilledString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

@Controller('v1/books/:user')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  getAll(@Param('user') user: string): Promise<BookDto[]> {
    return this.booksService.findAll(user);
  }

  @Get('private')
  getPrivate(@Param('user') user: string): Promise<BookDto[]> {
    return this.booksService.findPrivate(user);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async add(
    @Param('user') user: string,
    @Body() body: { name?: unknown; author?: unknown } | undefined,
  ): Promise<StatusDto> {
    const { name, author } = body ?? {};
    if (!isFilledString(name) || !isFilledString(author)) {
      throw new BadRequestException('name and author must be non-empty strings');
    }
    await this.booksService.add(user, { name, author });
    return { status: 'ok' };
  }

  @Put('reset')
  async reset(@Param('user') user: string): Promise<StatusDto> {
    await this.booksService.reset(user);
    return { status: 'ok' };
  }
}
