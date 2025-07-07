export const formatMongoDoc = (doc, deep = false) => {
  if (!doc || typeof doc !== 'object') return doc;

  const { _id, ...rest } = doc;

  const result = {
    id: _id?.toString(),
    ...rest
  };

  if (doc.createdAt instanceof Date) result.createdAt = doc.createdAt.toISOString();
  if (doc.updatedAt instanceof Date) result.updatedAt = doc.updatedAt.toISOString();

  if (deep) {
    for (const key in result) {
      const value = result[key];

      if (Array.isArray(value)) {
        result[key] = value.map(v => formatMongoDoc(v, true));
      } else if (typeof value === 'object' && value !== null) {
        result[key] = formatMongoDoc(value, true);
      }
    }
  }

  return result;
};

export default formatMongoDoc;
