enum Role {
  owner = 'owner',
  notary = 'notary',
  admin = 'admin',
}

type RoleDisplayMapType = Record<string, string>;
export const roleDisplayMap: RoleDisplayMapType = {
  owner: 'Owner',
  notary: 'Case Worker',
  admin: 'Admin',
};

export default Role;
