class PostExhaustedError extends Error {
  constructor(message) {
    super(message);

    this.statusCode = 404;
    // that's a pretty weird not naming things
    this.name = "PostExhaustedError";
  }
}

export default PostExhaustedError;
