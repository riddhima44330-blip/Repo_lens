const crypto = require("crypto");

const repositories = new Map();

function createRepository(context) {
  const repositoryId = crypto.randomUUID();

  repositories.set(repositoryId, {
    context,
    createdAt: Date.now()
  });

  return repositoryId;
}

function getRepository(repositoryId) {
  const repository = repositories.get(repositoryId);

  if (!repository) {
    return null;
  }

  return repository.context;
}

function deleteRepository(repositoryId) {
  repositories.delete(repositoryId);
}

module.exports = {
  createRepository,
  getRepository,
  deleteRepository
};