export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
export const notFound = (msg = 'مش موجود') => new HttpError(404, msg);
export const badRequest = (msg, details) => new HttpError(400, msg, details);
