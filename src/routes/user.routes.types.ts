import { Request } from 'express'
import { UserForm } from '../models/user.model'

export type UserGet = Request<{ id: string }>
export type UserPost = Request<never, unknown, UserForm>
export type UserPatch = Request<{ id: string }, unknown, Partial<UserForm>>
export type UserDelete = UserGet
