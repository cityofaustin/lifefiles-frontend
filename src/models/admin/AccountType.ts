import ViewFeature from './ViewFeature';
import CoreFeature from './CoreFeature';
import RoleType from './RoleType';

export default interface AccountType {
  _id?: string;
  accountTypeName: string;
  role: RoleType;
  adminLevel: number;
  viewFeatures: ViewFeature[];
  coreFeatures: CoreFeature[];
  action?: string; // needed for the grid, might split this out
}
