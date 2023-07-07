import { FormError, NotFoundError } from '../utils/errors'

export const USER_LIST: User[] = []

export type User = {
  id: string
  name: string
  email: string
}

export type UserForm = Omit<User, `id`>

/**
 * Computes the user ID by getting the highest ID and adding 1.
 */
export const computeUserId = (): string => {
  const maxId = Math.max(...USER_LIST.map((u) => parseInt(u.id)), 0)
  return (maxId + 1).toString()
}

/**
 * Gets the user by ID. Throws an error if not found.
 * @param id
 * @param useIdx If true, returns the index of the user instead of the user itself.
 */
export const getUser = (id: string, useIdx = false) => {
  const idx = USER_LIST.findIndex((u) => u.id === id)
  if (idx === -1) throw new NotFoundError()
  
  return useIdx ? idx : USER_LIST[idx]
}

export const getAllUsers = () => USER_LIST

/**
 * Creates a new user, adds it to the list, and returns it.
 * Throws an error if the form has a missing or incorrect field.
 * Trims the name and email.
 * @param form
 */
export const createUser = (form: UserForm) => {
  if (!(`name` in form))
    throw new FormError(`Missing name`)
  if (!(`email` in form))
    throw new FormError(`Missing email`)
  
  const user = {
    id: computeUserId(),
    ...preprocessUserForm(form),
  }
  
  USER_LIST.push(user)
  
  return user
}

export const deleteUser = (id: string) => {
  const idx = getUser(id, true) as number
  USER_LIST.splice(idx, 1)
}

/**
 * Updates the user partially, without requiring all fields.
 * @param id
 * @param form
 */
export const partialUpdateUser = (id: string, form: Partial<UserForm>) => {
  const user = getUser(id) as User
  Object.assign(user, preprocessUserForm(form, user.email))
  return user
}

/**
 * Preprocesses the user form by converting the fields to string,
 * trimming the name and email, and validating the email.
 * @param form
 * @param email
 */
export const preprocessUserForm = <T extends UserForm | Partial<UserForm>>(form: T, email?: string): T => {
  const tempForm = {} as T
  
  // Validate that the form fields are strings
  if (form.name && typeof form.name !== `string`)
    throw new FormError(`Name must be a string`)
  if (form.email && typeof form.email !== `string`)
    throw new FormError(`Email must be a string`)
  
  // Trim the form fields
  if (form.name) tempForm.name = form.name.trim()
  if (form.email) tempForm.email = form.email.trim()
  
  // Validate the email
  const tempEmail = tempForm.email || email
  if (!tempEmail)
    throw new Error(`Either form.email or email must be provided`)
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/.test(tempEmail.toUpperCase()))
    throw new FormError(`Invalid email`)
  
  return tempForm
}
