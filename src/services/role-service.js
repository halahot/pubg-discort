module.exports = (user, kds, roles) => {
  const newRole = findRoleByKds(roles, kds);
  user.addRole(newRole);
};

function findRoleByKds (array, kds) {
  const filterArray = array.filter(item => item.kd <= kds);
  if (filterArray.length > 0) {
    return (filterArray[filterArray.length - 1]);
  }
}
