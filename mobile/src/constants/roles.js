export const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  RIDER: 'rider',
  ADMIN: 'admin',
});

export const ROLE_VALUES = Object.freeze(Object.values(ROLES));
export const REGISTRABLE_ROLES = Object.freeze([
  ROLES.CUSTOMER,
  ROLES.VENDOR,
  ROLES.RIDER,
]);
export const DEFAULT_ROLE = ROLES.CUSTOMER;

export const ROLE_META = Object.freeze({
  [ROLES.CUSTOMER]: {
    label: 'Customer',
    icon: 'fast-food-outline',
    description: 'Order and track meals',
    homeTab: 'Home',
  },
  [ROLES.VENDOR]: {
    label: 'Restaurant',
    icon: 'restaurant-outline',
    description: 'Manage your kitchen',
    homeTab: 'Kitchen',
  },
  [ROLES.RIDER]: {
    label: 'Rider',
    icon: 'bicycle-outline',
    description: 'Accept and deliver orders',
    homeTab: 'Available',
  },
  [ROLES.ADMIN]: {
    label: 'Admin',
    icon: 'shield-outline',
    description: 'Oversee the platform',
    homeTab: 'Kitchen',
  },
});

export const PERMISSIONS = Object.freeze({
  MANAGE_ORDERS: [ROLES.VENDOR, ROLES.ADMIN],
  WORK_DELIVERIES: [ROLES.RIDER],
  LIST_RIDERS: [ROLES.VENDOR, ROLES.ADMIN],
});

export const REGISTRATION_ROLES = Object.freeze(
  REGISTRABLE_ROLES.map((role) => ({ role, ...ROLE_META[role] }))
);

export const normalizeRole = (role) =>
  ROLE_VALUES.includes(role) ? role : DEFAULT_ROLE;

export const can = (role, permission) =>
  Boolean(PERMISSIONS[permission] && PERMISSIONS[permission].includes(role));

export const homeTabForRole = (role) => ROLE_META[normalizeRole(role)].homeTab;
