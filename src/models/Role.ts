enum Role {
  owner = 'owner',
  notary = 'notary',
  helper = 'helper',
  admin = 'admin',
}

type RoleDisplayMapType = Record<string, string>;
export const roleDisplayMap: RoleDisplayMapType = {
  owner: 'Owner',
  notary: 'Case Worker',
  helper: 'Case Worker',
  admin: 'Admin',
};

export default Role;
