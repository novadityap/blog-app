const hasPermission = (permissions, action, resource) => {
  return permissions.some(
    permission =>
      permission.action === action && permission.resource === resource
  );
};

export default hasPermission;
