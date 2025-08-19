class UserExistError extends Error {
  constructor(message) {
    super(message);

    this.statusCode = 404;
    this.name = "UserExistError";
  }
}

export default UserExistError;
