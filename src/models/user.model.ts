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
  
  const trimmedForm = trimUserForm(form) as UserForm
  
  if (!isValidEmail(trimmedForm.email))
    throw new FormError(`Invalid email`)
  
  const user = {
    id: computeUserId(),
    ...trimmedForm,
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
  const user = getUser(id)
  Object.assign(user, trimUserForm(form))
  return user
}

/**
 * Simple email validation.
 * @param email
 */
export const isValidEmail = (email: string) => {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/.test(email.toUpperCase())
}

/**
 * Removes leading and trailing spaces from the name and email, if any.
 * Returns a new object.
 * @param form
 */
export const trimUserForm = (form: Partial<UserForm>): UserForm | Partial<UserForm> => {
  const trimmedForm = {} as Partial<UserForm>
  if (form.name) trimmedForm.name = form.name.trim()
  if (form.email) trimmedForm.email = form.email.trim()
  return trimmedForm
}