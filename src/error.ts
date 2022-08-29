
/**
 * Allows throwing an error that will be propagated to the user with the given HTTP status code.
 */
export class ApiError extends Error {
   readonly status: number;
   
   /**
    * Creates a new ApiError instance.
    * @param status the HTTP status code to use in the response.
    * @param message  the error message to return with in the response.
    */
    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}
