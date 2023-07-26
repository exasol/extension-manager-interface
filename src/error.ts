
/**
 * Allows throwing an error that will be propagated to the user with the given HTTP status code.
 */
class ApiError extends Error {
    readonly status: number;
    /**
     * Creates a new ApiError instance.
     * @param status the HTTP status code to use in the response.
     * @param message the error message.
     */
    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

/**
 * Represents a general error that is propagated to the user (status code 400).
 */
export class BadRequestError extends ApiError {
    /**
     * Creates a new BadRequestError instance.
     * @param message the error message.
     */
    constructor(message: string) {
        super(400, message)
    }
}

/**
 * Represents a "not found" error that is propagated to the user (status code 404).
 */
export class NotFoundError extends ApiError {
    /**
     * Creates a new NotFoundError instance.
     * @param message the error message.
     */
    constructor(message: string) {
        super(404, message)
    }
}

/**
 * Represents a "not modified" error that is propagated to the user (status code 304).
 */
export class NotModified extends ApiError {
    /**
     * Creates a new NotModified instance.
     * @param message the error message.
     */
    constructor(message: string) {
        super(304, message)
    }
}

/**
 * Represents an internal server error that is **not** propagated to the user but only logged (status code 500).
 */
export class InternalServerError extends Error {
    /**
     * Creates a new InternalServerError instance.
     * @param message the error message.
     */
    constructor(message: string) {
        super(message)
    }
}
