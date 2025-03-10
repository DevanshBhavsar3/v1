const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let todos = [];

app.get('/todos', (req, res) => {
  res.json(todos);
});

app.post('/todos', (req, res) => {
  const newTodo = {
    id: todos.length + 1,
    title: req.body.title,
    completed: false
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.put('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id);
  const todoIndex = todos.findIndex(todo => todo.id === todoId);

  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  todos[todoIndex] = {
    ...todos[todoIndex],
    ...req.body
  };
  res.json(todos[todoIndex]);
});

app.delete('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id);
  todos = todos.filter(todo => todo.id !== todoId);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});