export interface Card {
  id: string
  title: string
  description?: string
  tags?: Tag[]
  dueDate?: string | Date
  attachments?: Attachment[]
  order: number
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
}

export interface Column {
  id: string
  title: string
  cards: Card[]
  cardLimit?: number
  color?: string
}

export interface Board {
  id: string
  title: string
  columns: Column[]
  userId?: string
  createdAt?: string
}

// Interfaces para objetos de entrada (Input) que não precisam do ID

export interface TagInput {
  name: string
  color: string
}

export interface AttachmentInput {
  name: string
  url: string
  type: string
}

export interface CardInput {
  title: string
  description?: string
  tags?: TagInput[]
  dueDate?: string | Date
  attachments?: AttachmentInput[]
  order: number
}

