import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'books', versionKey: false })
export class Book {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  author: string;

  // Nickname of the user who added the book. Shared books have no owner.
  @Prop({ type: String, index: true })
  ownerId?: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
