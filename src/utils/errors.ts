export class NotFoundError extends Error {
  name = `NotFoundError`
  constructor() {
    super()
  }
}

export class FormError extends Error {
  name = `FormError`
  constructor(public message: string) {
    super()
  }
}