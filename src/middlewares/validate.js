/** validate({ body: schema, query: schema, params: schema }) */
export const validate = (schemas) => (req, _res, next) => {
  if (schemas.body) req.body = schemas.body.parse(req.body);
  if (schemas.params) req.params = schemas.params.parse(req.params);
  if (schemas.query) {
    // في Express 5 الـ req.query getter فقط، فبنخزن النتيجة في مكان تاني
    req.validatedQuery = schemas.query.parse(req.query);
  }
  next();
};
