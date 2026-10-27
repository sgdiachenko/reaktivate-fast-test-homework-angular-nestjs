import { Component, OnInit, inject, signal } from '@angular/core';
import { BookDto, BooksRepository } from './books/books.repository';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly booksRepository = inject(BooksRepository);
  protected readonly list = signal<BookDto[]>([]);

  async ngOnInit(): Promise<void> {
    const books = await this.booksRepository.getBooks();
    this.list.set(books);
  }

  protected add(): void {
    alert('TBD');
  }
}
