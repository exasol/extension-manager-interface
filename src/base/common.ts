

/** Successful result of a function. */
export type SuccessResult<T> = { type: "success", result: T }
/** Failure result of a function. */
export type FailureResult = { type: "failure", message: string }

/**
 * Represents a result of an operation that can be successful or a failure.
 * In case of success it contains the result, in case of error it contains an error message.
 */
export type Result<T> = SuccessResult<T> | FailureResult

/**
 * Create a new {@link SuccessResult}.
 * @param result the result value
 * @returns a new {@link SuccessResult}
 */
export function successResult<T>(result: T): SuccessResult<T> {
    return { type: "success", result }
}

/**
 * Create a new {@link FailureResult}.
 * @param message error message
 * @returns a new {@link FailureResult}
 */
export function failureResult(message: string): FailureResult {
    return { type: "failure", message }
}
