export enum GlobErrorType {
  AuthError,
  InputError,
  NotFoundError,
  ForbiddenError,
  InternalError
}

export function newGlobError(type: GlobErrorType, message: string): GlobError {
  return new GlobError(type, message)
}

export class GlobError extends Error {
  type: GlobErrorType
  debug: any

  constructor(type: GlobErrorType, message: string) {
    super(message)
    this.type = type
  }

  public withDebug(debug: any) {
    this.debug = debug
    return this
  }
}
