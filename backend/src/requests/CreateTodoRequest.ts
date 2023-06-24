/**
 * Fields in a request to create a single TODO item.
 */
export interface CreateTodoRequest {
  name: string;
  dueDate: string;
}

export interface CreateTodoPayload extends CreateTodoRequest {
  userId: string;
  done: boolean;
  todoId: string;
  createdAt: string;
  attachmentUrl: string;
}
