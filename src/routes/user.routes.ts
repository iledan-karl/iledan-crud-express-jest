import { NextFunction, Request, Response, Router } from 'express'
import { createUser, deleteUser, getAllUsers, getUser, partialUpdateUser } from '../models/user.model'
import { FormError, NotFoundError } from '../utils/errors'
import { UserDelete, UserGet, UserPatch, UserPost } from './user.routes.types'

const router = Router()

// Method routes
router.get(`/:id`, (req: UserGet, res) =>
  res.json(getUser(req.params.id)))

router.get(`/`, (req, res) =>
  res.json(getAllUsers()))

router.post(`/`, (req: UserPost, res) =>
  res.status(201).json(createUser(req.body)))

router.patch(`/:id`, (req: UserPatch, res) =>
  res.json(partialUpdateUser(req.params.id, req.body)))

router.delete(`/:id`, (req: UserDelete, res) => {
  deleteUser(req.params.id)
  res.sendStatus(204)
})

/*
  * Error handler for cases such as when the user ID is not found, or when
  * the form has a missing or invalid field. Catch-all for other unexpected errors.
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  switch (err.constructor) {
    case NotFoundError:
      res.status(404).send(`User not found`)
      break
    case FormError:
      res.status(400).send(err.message)
      break
    default:
      res.status(500).send(`Internal server error`)
      break
  }
}
router.use(errorHandler)

export default router