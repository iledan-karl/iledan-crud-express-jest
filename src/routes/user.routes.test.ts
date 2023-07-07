import supertest from 'supertest'
import { app } from '../app'
import { USER_LIST } from '../models/user.model'
import * as userModel from '../models/user.model'

const api = supertest(app),
  testUsers = [
    { id: `0`, name: `John`, email: `john@domain.com` },
    { id: `1`, name: `Joan`, email: `joan@domain.com` },
  ],
  testForms = [
    { name: `John`, email: `john@domain.com` },
    { name: `Joan`, email: `joan@domain.com` },
  ]

beforeEach(() => USER_LIST.splice(0))

describe(`GET /users and /users/:id`, () => {
  beforeEach(() => USER_LIST.push(...testUsers))
  
  it(`should return all users`, async () => {
    await api.get(`/users`)
      .expect(200)
      .expect(`Content-Type`, /application\/json/)
      .expect(testUsers)
  })
  
  it(`should allow empty users`, async () => {
    USER_LIST.splice(0)
    
    await api.get(`/users`)
      .expect(200)
      .expect(`Content-Type`, /application\/json/)
      .expect([])
  })
  
  it(`should return user by id`, async () => {
    await api.get(`/users/1`)
      .expect(200)
      .expect(`Content-Type`, /application\/json/)
      .expect(testUsers[1])
  })
  
  it(`should return 404 when user is not found`, async () => {
    await api.get(`/users/71`)
      .expect(404)
      .expect(`User not found`)
  })
})

describe(`POST /users`, () => {
  it(`should create a user`, async () => {
    const form = testForms[0]
    await api.post(`/users`)
      .send(form)
      .expect(201)
    
    expect(USER_LIST).toHaveLength(1)
    expect(USER_LIST).toEqual([{ id: `1`, ...testForms[0] }])
  })
  
  it(`should return 201 and the created user`, async () => {
    const form = testForms[1]
    
    await api.post(`/users`)
      .send(form)
      .expect(201)
      .expect(`Content-Type`, /application\/json/)
      .expect({ id: `1`, ...form })
  })
  
  it(`should return 400 when form is incomplete`, async () => {
    const form = { name: `Jim` }
    
    await api.post(`/users`)
      .send(form)
      .expect(400)
      .expect(/(Missing name|Missing email)/)
  })
})

describe(`PATCH /users/:id`, () => {
  beforeEach(() => USER_LIST.push(...testUsers))
  
  it(`should patch the user`, async () => {
    await api.patch(`/users/1`)
      .send({ email: `newjoan@domain.com` })
    
    expect(USER_LIST).toEqual([
      testUsers[0],
      { ...testUsers[1], email: `newjoan@domain.com` },
    ])
  })
  
  it(`should return 200 and the patched user`, async () => {
    const form = { name: `New Joan` }
    
    await api.patch(`/users/1`)
      .send(form)
      .expect(200)
      .expect(`Content-Type`, /application\/json/)
      .expect({ ...testUsers[1], name: `New Joan` })
  })
})

describe(`DELETE /users/:id`, () => {
  beforeEach(() => USER_LIST.push(...testUsers))
  
  it(`should delete the user`, async () => {
    await api.delete(`/users/0`)
    
    expect(USER_LIST).toHaveLength(1)
    expect(USER_LIST).toEqual([testUsers[1]])
  })
  
  it(`should return 204 when successful`, async () => {
    await api.delete(`/users/1`)
      .expect(204)
  })
  
  it(`should return 404 when the user is not found`, async () => {
    await api.delete(`/users/84`)
      .expect(404)
      .expect(`User not found`)
  })
})

describe(`error handler`, () => {
  const spy = {
    createUser: jest.spyOn(userModel, `createUser`),
    getAllUsers: jest.spyOn(userModel, `getAllUsers`),
    getUser: jest.spyOn(userModel, `getUser`),
    partialUpdateUser: jest.spyOn(userModel, `partialUpdateUser`),
    deleteUser: jest.spyOn(userModel, `deleteUser`),
  }
  
  beforeEach(() => jest.resetAllMocks())
  
  describe.each([
    [api.get, spy.getUser],
    [api.delete, spy.deleteUser],
    [api.patch, spy.partialUpdateUser],
  ])(`GET, PATCH, DELETE /users/:id`, (apiMethod, spyInstance) => {
    const PATH = `/users/44`,
      IS_PATCH = apiMethod === api.patch
    
    it(`should throw error if user is not found`, async () => {
      const form = { name: `Jim` },
        requestBody = IS_PATCH ? form : undefined
      
      await apiMethod(PATH).send(requestBody)
      
      expect(spyInstance).not.toHaveReturned()
      if (IS_PATCH)
        expect(spyInstance).toHaveBeenCalledWith(`44`, form)
      else
        expect(spyInstance).toHaveBeenCalledWith(`44`)
    })
    
    it(`should catch error and return 404`, async () => {
      await apiMethod(PATH)
        .expect(404)
        .expect(`User not found`)
    })
  })
  
  describe.each([
    [{ name: `Jim` }, `Missing email`],
    [{ email: `jim@domain.com` }, `Missing name`],
    [{ name: `Jim`, email: `jim` }, `Invalid email`],
    [{ name: 123, email: `jim@domain.com` }, `Name must be a string`],
    [{ name: `Jim`, email: 456 }, `Email must be a string`],
  ])(`POST /users`, (form, error) => {
    it(`should throw error if form is incomplete or invalid`, async () => {
      await api.post(`/users`).send(form)
      
      expect(spy.createUser).toHaveBeenCalledWith(form)
      expect(spy.createUser).not.toHaveReturned()
    })
    
    it(`should catch error and return 400`, async () => {
      await api.post(`/users`)
        .send(form)
        .expect(400)
        .expect(error)
    })
  })
  
  it.each([
    [new Error()],
    [new TypeError()],
    [new RangeError()],
    [new Error(`Unknown error`)],
  ])(`should throw 500 for other unexpected errors`, async (error) => {
    spy.getAllUsers.mockImplementation(() => { throw error })
    
    await api.get(`/users`)
      .expect(500)
      .expect(`Internal server error`)
  })
})
