/**
 * Wrapper handlers with error catching
 */
export const protect = async (fn) => {
  return async (req, meta) => fn(req, meta).catch(e => 404);
}
