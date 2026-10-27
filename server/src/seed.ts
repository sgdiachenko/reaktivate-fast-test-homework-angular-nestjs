import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from './app.module.js';
import { Book } from './books/book.schema.js';

// Synthetic data. Fixed _ids make the seed idempotent: re-running it never duplicates books.
const SEED_BOOKS: (Book & { _id: Types.ObjectId })[] = [
  { _id: new Types.ObjectId('000000000000000000000001'), name: 'Shared Book 1', author: 'Seed Author A' },
  { _id: new Types.ObjectId('000000000000000000000002'), name: 'Shared Book 2', author: 'Seed Author B' },
  { _id: new Types.ObjectId('000000000000000000000003'), name: 'Shared Book 3', author: 'Seed Author C' },
  { _id: new Types.ObjectId('000000000000000000000004'), name: 'Private Book 1', author: 'Seed Author D', ownerId: 'demo' },
  { _id: new Types.ObjectId('000000000000000000000005'), name: 'Private Book 2', author: 'Seed Author E', ownerId: 'demo' },
];

const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
try {
  const books = app.get<Model<Book>>(getModelToken(Book.name));
  const result = await books.bulkWrite(
    SEED_BOOKS.map(({ _id, ...book }) => ({
      updateOne: { filter: { _id }, update: { $setOnInsert: book }, upsert: true },
    })),
  );
  console.info(
    `Seed: inserted ${result.upsertedCount}, already present ${SEED_BOOKS.length - result.upsertedCount}`,
  );
} finally {
  await app.close();
}
