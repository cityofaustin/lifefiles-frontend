
export enum SettingNameEnum {
  TITLE = 'title',
  LOGO = 'logo'
}

export default interface AppSetting {
  settingName: string;
  settingValue: string;
}
