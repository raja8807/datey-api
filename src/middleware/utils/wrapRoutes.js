const asyncHandler = require('../asyncHandler');

// Wrap all route handlers with asyncHandler
const wrapRoutes = (router) => {
  router.stack.forEach((layer) => {
    if (layer.route) {
      Object.entries(layer.route.methods).forEach(() => {
        const routeStack = layer.route.stack;
        routeStack.forEach((middleware, index) => {
          if (middleware.name !== 'asyncHandler') {
            routeStack[index].handle = asyncHandler(routeStack[index].handle);
          }
        });
      });
    }
  });
};

module.exports = wrapRoutes;
