import RoleType from './RoleType';

export default interface CoreFeature {
  _id: string;
  featureName: string;
  featureDisplay: string;
  featureRole: RoleType;
}
