export type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
