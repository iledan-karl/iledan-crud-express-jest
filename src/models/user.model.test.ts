import { FormError, NotFoundError } from '../utils/errors'
import * as userModel from './user.model'
import {
  computeUserId,
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  isValidEmail,
  partialUpdateUser,
  User,
  USER_LIST,
} from './user.model'

const testUsers: User[] = [
  {
    id: `0`,
    name: `John`,
    email: `john@domain.com`,
  }, {
    id: `1`,
    name: `Jane`,
    email: `jane@domain.com`,
  }, {
    id: `2`,
    name: `Jack`,
    email: `jack@domain.com`,
  },
]

beforeEach(() => {
  USER_LIST.splice(0, USER_LIST.length, ...testUsers)
  jest.resetAllMocks()
})

describe(`computeUserId`, () => {
  it(`should return highest ID + 1`, () => {
    USER_LIST.push({
      id: `475`,
      name: `Jim`,
      email: `jim@domain.com`,
    })
    const id = computeUserId()
    expect(id).toBe(`476`)
  })
  
  it(`should return 1 if no users`, () => {
    USER_LIST.splice(0, USER_LIST.length)
    const id = computeUserId()
    expect(id).toBe(`1`)
  })
})

describe(`getUser`, () => {
  it(`should return matching user`, () => {
    const user = getUser(`2`)
    expect(user).toEqual(testUsers[2])
  })
  
  it(`should return matching user's index if index flag is enabled`, () => {
    const idx = getUser(`1`, true)
    expect(idx).toBe(1)
  })
  
  it(`should throw NotFoundError if no matching user`, () => {
    expect(() =>
      getUser(`77`),
    ).toThrow(NotFoundError)
  })
})

describe(`getAllUsers`, () => {
  it(`should return all users`, () => {
    const users = getAllUsers()
    expect(users).toEqual(testUsers)
  })
  
  it(`should return blank array if no users`, () => {
    USER_LIST.splice(0, USER_LIST.length)
    
    const users = getAllUsers()
    expect(users).toEqual([])
  })
})

describe(`createUser`, () => {
  const form = Object.freeze({
    name: `Jim`,
    email: `jim@domain.com`,
  })
  
  it(`should create user`, () => {
    createUser(form)
    
    // No need to test the ID as it's already tested in another block
    expect(USER_LIST).toContainEqual(expect.objectContaining(form))
  })
  
  it(`should use computeUserId()'s return for id`, () => {
    jest.spyOn(userModel, `computeUserId`).mockReturnValue(`43`)
    const user = createUser(form)
    expect(user.id).toBe(`43`)
  })
  
  it(`should throw FormError if has missing name`, () => {
    expect(() =>
      createUser({ email: form.email } as never),
    ).toThrow(new FormError(`Missing name`))
  })
  
  it(`should throw FormError if has missing email`, () => {
    expect(() =>
      createUser({ name: form.name } as never),
    ).toThrow(new FormError(`Missing email`))
  })
  
  it(`should throw FormError if 'isValidEmail' returns false`, () => {
    jest.spyOn(userModel, `isValidEmail`).mockReturnValue(false)
    
    expect(() => createUser(form))
      .toThrow(new FormError(`Invalid email`))
  })
  
  it(`should trim name and email`, () => {
    createUser({
      name: `  Jim  `,
      email: `  jim@domain.com  `,
    })
    
    const user = USER_LIST[USER_LIST.length - 1] as User
    
    expect(user.name).toBe(`Jim`)
    expect(user.email).toBe(`jim@domain.com`)
  })
})

describe(`deleteUser`, () => {
  it(`should delete matching user`, () => {
    deleteUser(`1`)
    expect(USER_LIST).not.toContainEqual(testUsers[1])
  })
  
  it(`should throw NotFoundError if no matching user`, () => {
    expect(() =>
      deleteUser(`83`),
    ).toThrow(NotFoundError)
  })
})

describe(`partialUpdateUser`, () => {
  const form = { name: `Jim` }
  
  it(`should update matching user`, () => {
    partialUpdateUser(`1`, form)
    expect(USER_LIST[1]).toEqual({
      ...testUsers[1],
      name: form.name,
    })
  })
  
  it(`should throw NotFoundError if no matching user`, () => {
    expect(() =>
      partialUpdateUser(`83`, form),
    ).toThrow(NotFoundError)
  })
})

describe(`isValidEmail`, () => {
  it.each([
    [true, `jim@company.tech`],
    [true, `jim@company.com`],
    [false, `jim@domain`],
    [false, `jimmy`],
    [false, `jim@@company.com`],
  ])(`should return accordingly if valid or invalid email`, (isValid, email) => {
    const bool = isValidEmail(email)
    
    expect(bool).toBe(isValid)
  })
})