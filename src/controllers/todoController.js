import { OK, CREATED, BAD_REQUEST, NOT_FOUND, ACCEPTED } from 'http-status';

import * as TodoService from '../services/TodoService';
import { createTodoSchema } from '../validators/todoValidator';
import { formatJoiError } from '../lib/utils';
import { NotFoundError } from '../lib/errors';

export async function listTodos(req, res, next) {
  try {
    const todos = await TodoService.getUserTodos(req.userID);
    res.status(OK).json({
      status: OK,
      response: { todos },
    });
  } catch (e) {
    next(e);
  }
}

export async function createTodo(req, res, next) {
  try {
    const { error } = createTodoSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(BAD_REQUEST).json({
        status: BAD_REQUEST,
        errors: formatJoiError(error),
      });
    }

    const data = { ...req.body, user: req.userID };
    const todo = await TodoService.createTodo(data);
    return res.status(CREATED).json({
      status: CREATED,
      response: { todo },
    });
  } catch (e) {
    return next(e);
  }
}

export async function ensureTodoExists(req, res, next, id) {
  try {
    const todo = await TodoService.findById(id);
    if (!todo) {
      res.status(NOT_FOUND).json(NotFoundError);
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
}

export async function trashTodo(req, res, next) {
  const { id } = req.params;
  try {
    const todo = await TodoService.updateById(id, { trashed: true });
    res.status(ACCEPTED).json({
      status: ACCEPTED,
      response: { todo },
    });
  } catch (e) {
    next(e);
  }
}

export async function untrashTodo(req, res, next) {
  const { id } = req.params;
  try {
    const todo = await TodoService.updateById(id, { trashed: false });
    res.status(ACCEPTED).json({
      status: ACCEPTED,
      response: { todo },
    });
  } catch (e) {
    next(e);
  }
}
