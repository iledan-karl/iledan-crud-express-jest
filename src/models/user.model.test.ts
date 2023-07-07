import { FormError, NotFoundError } from '../utils/errors'
import * as userModel from './user.model'
import {
  computeUserId,
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  partialUpdateUser,
  preprocessUserForm,
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
  
  it(`should use the form returned by 'preprocessUserForm'`, () => {
    const spy = jest.spyOn(userModel, `preprocessUserForm`)
      .mockImplementation(() => ({
        name: `Janice`,
        email: `janice@domain.com`,
      }))
    
    createUser(form)
    const user = USER_LIST[USER_LIST.length - 1] as User
    
    expect(spy).toHaveBeenCalled()
    expect(user.name).toBe(`Janice`)
    expect(user.email).toBe(`janice@domain.com`)
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
  
  it(`should use the form returned by 'preprocessUserForm'`, () => {
    const spy = jest.spyOn(userModel, `preprocessUserForm`)
      .mockImplementation(() => ({ email: `janice@domain.com` }))
    
    partialUpdateUser(`1`, form)
    
    expect(spy).toHaveBeenCalled()
    expect(USER_LIST[1].email).toBe(`janice@domain.com`)
  })
})

describe(`preprocessUserForm`, () => {
  it(`should throw FormError if name isn't a string`, () => {
    expect(() =>
      preprocessUserForm({ name: 123, email: `` } as never),
    ).toThrow(new FormError(`Name must be a string`))
  })
  
  it(`should throw FormError if email isn't a string`, () => {
    expect(() =>
      preprocessUserForm({ name: ``, email: 456 } as never),
    ).toThrow(new FormError(`Email must be a string`))
  })
  
  it(`should trim name and email`, () => {
    const form = { name: `  Jane  `, email: `  jane@domain.com   ` },
      
      newForm = preprocessUserForm(form)
    
    expect(newForm).toEqual({
      name: `Jane`,
      email: `jane@domain.com`,
    })
  })
  
  it.each([
    [`jim@domain`],
    [`jimmy`],
    [`jim@@company.com`],
  ])(`should throw FormError if email is invalid`, (email) => {
    expect(() =>
      preprocessUserForm({ name: `Jim`, email } as never),
    ).toThrow(new FormError(`Invalid email`))
  })
  
  it(`should throw Error if both form.email and the 'email' param are missing`, () => {
    expect(() =>
      preprocessUserForm({ name: `Jim` } as never),
    ).toThrow(new Error(`Either form.email or email must be provided`))
  })
  
  it(`should accept partial form`, () => {
    const form = { email: `jack@domain.com` },
      
      newForm = preprocessUserForm(form)
    
    expect(newForm).toEqual({ email: `jack@domain.com` })
  })
})
