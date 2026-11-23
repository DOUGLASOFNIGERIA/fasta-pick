const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  RIDER: 'rider',
  ADMIN: 'admin',
});

const ROLE_VALUES = Object.freeze(Object.values(ROLES));
const REGISTRABLE_ROLES = Object.freeze([
  ROLES.CUSTOMER,
  ROLES.VENDOR,
  ROLES.RIDER,
]);
const DEFAULT_ROLE = ROLES.CUSTOMER;

const PERMISSIONS = Object.freeze({
  MANAGE_ORDERS: [ROLES.VENDOR, ROLES.ADMIN],
  WORK_DELIVERIES: [ROLES.RIDER],
  LIST_RIDERS: [ROLES.VENDOR, ROLES.ADMIN],
});

const isRole = (role) => ROLE_VALUES.includes(role);

const can = (role, permission) =>
  Boolean(PERMISSIONS[permission] && PERMISSIONS[permission].includes(role));

module.exports = {
  ROLES,
  ROLE_VALUES,
  REGISTRABLE_ROLES,
  DEFAULT_ROLE,
  PERMISSIONS,
  isRole,
  can,
};
