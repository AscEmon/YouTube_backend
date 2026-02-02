class ApiResponse {
    constructor(statusCode, data, message = "Success", stack = "") {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.stack = stack
        this.success = statusCode < 400
    }
}

export { ApiResponse }