import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Movie extends Document {
  @Prop()
  tmdbId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop([String])
  genres: string[];

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ type: [{ userId: String, rating: Number }] })
  ratings: { userId: string; rating: number }[];

  @Prop()
  releaseDate: string;

  @Prop({ default: false })
  adult: boolean;

  @Prop()
  poster: string;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
