class JwtDecodeError extends Error {
  constructor(message) {
    super(message);

    this.statusCode = 404;
    this.name = "jwtDecodeError";
  }
}

export default JwtDecodeError;
