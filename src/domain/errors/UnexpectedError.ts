export class UnexpectedError extends Error {
  constructor() {
    super("Ocorreu um erro inesperado. Tente mais tarde.");
    this.name = "UnexpectedError";
  }
}
