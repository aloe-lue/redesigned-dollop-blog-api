class DeletePostError extends Error {
  constructor(message) {
    super(message);

    this.statusCode = 404;
    this.name = "NotFoundError";
  }
}

export default DeletePostError;
