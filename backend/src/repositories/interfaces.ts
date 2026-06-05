/**
 * Generic CRUD interface that all repositories must implement.
 * Swap the in-memory implementation for a Firestore one by implementing this interface.
 */
export interface IRepository<T, CreateDTO, UpdateDTO = Partial<CreateDTO>> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}
