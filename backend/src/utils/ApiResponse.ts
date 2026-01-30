class ApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: any;
  meta?: any;

  constructor(statusCode: number, data: any, message = "Success", meta?: any) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }
}

export default ApiResponse;
