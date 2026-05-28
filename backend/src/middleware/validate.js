/**
 * Validate req.body / req.query / req.params against Zod schemas.
 * Replaces the field on req with the parsed (and type-coerced) value.
 *
 * Usage:
 *   router.post('/x', validate({ body: mySchema }), controller.handler)
 */
function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      next();
    } catch (err) {
      next(err); // ZodError is handled in errorHandler
    }
  };
}

module.exports = validate;
