const parseId = (value) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
};

const requireId = (res, value, label = 'ID') => {
  const id = parseId(value);
  if (id === null) {
    res.status(400).json({ error: `Invalid ${label}` });
    return null;
  }
  return id;
};

module.exports = { parseId, requireId };
