import supertest from 'supertest'
import { app } from './app'

const api = supertest(app)

describe(`app`, () => {
  it.each([
    [api.get, `/blah`],
    [api.get, `/`],
    [api.delete, `/users`], // Should be /users/:id
    [api.patch, `/users`], // Same as above
    [api.get, `/users/1/3`], // Same as above, or /users
    [api.put, `/users/1`], // Use PATCH instead
  ])(`should return 404 for unsupported endpoints`, async (apiMethod, path) => {
    await apiMethod(path)
      .expect(404)
      .expect(`Endpoint not found`)
  })
})