import { HttpException, HttpStatus } from '@nestjs/common'

export class PaymentRequiredException extends HttpException {
  constructor(objectOrError?: string | object | any, description = 'Payment Required') {
    super(
      HttpException.createBody(objectOrError, description, HttpStatus.PAYMENT_REQUIRED),
      HttpStatus.PAYMENT_REQUIRED,
    )
  }
}
