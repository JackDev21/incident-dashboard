import { Document } from 'mongoose';

export interface User {
  id?: string
  name: string
  email: string
  password?: string // Opcional porque no siempre queremos devolverlo en las respuestas
  createdAt?: Date
  updatedAt?: Date
}

export interface IUserDocument extends User, Document {}
