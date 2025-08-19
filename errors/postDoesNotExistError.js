class PostDoesNotExistError extends Error {
  constructor(message) {
    super(message);

    this.statusCode = 404;
    this.name = "postDoesNotExistError";
  }
}

export default PostDoesNotExistError;
