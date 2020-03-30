enum Role {
  owner = 'owner',
  notary = 'notary'
}

type RoleDisplayMapType = Record<string, string>;
export const roleDisplayMap: RoleDisplayMapType = {
  owner: 'Owner',
  notary: 'Case Worker'
};

export default Role;
