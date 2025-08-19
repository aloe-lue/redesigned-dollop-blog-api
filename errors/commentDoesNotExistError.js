class CommentDoesNotExistError extends Error {
  constructor(message) {
    super(message);

    this.statusCode = 404;
    this.name = "commentDoesNotExistError";
  }
}

export default CommentDoesNotExistError;
