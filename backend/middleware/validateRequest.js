export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed.',
        issues: result.error.flatten(),
      });
    }

    req.body = result.data;
    return next();
  };
}