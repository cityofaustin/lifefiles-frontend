import React, { Component, Fragment } from 'react';

import AdminDocumentType from '../../admin/AdminDocumentType';
import AdminService from '../../../services/AdminService';
import './AdminPage.scss';
import CheckboxCellRenderer from '../../common/CheckboxCellRenderer';
import CheckboxNameCellRenderer from '../../common/CheckboxNameCellRenderer';
import RoleCellRenderer from '../../common/RoleCellRenderer';
import AccountTypeCellRenderer from '../../common/AccountTypeCellRenderer';
import ActionsCellRenderer from '../../common/ActionsCellRenderer';
import { ReactComponent as AddSvg } from '../../../img/add.svg';
import { ReactComponent as SaveSvg } from '../../../img/save.svg';

import { AgGridReact } from 'ag-grid-react';
import { Alert } from 'reactstrap';
import {
  GridApi,
  ColumnApi,
  GridOptions,
  CellValueChangedEvent,
  ColDef,
} from 'ag-grid-community';
import Account from '../../../models/Account';
import AccountType from '../../../models/admin/AccountType';
import CoreFeature from '../../../models/admin/CoreFeature';
import ViewFeature from '../../../models/admin/ViewFeature';
import DocumentType from '../../../models/DocumentType';
import RoleType from '../../../models/admin/RoleType';
import Role from '../../../models/Role';
import FileUploader from '../../common/FileUploader';
import AppSetting, { SettingNameEnum } from '../../../models/AppSetting';
import AccountService from '../../../services/AccountService';

interface AdminPageProps {
  account: Account;
  appSettings: AppSetting[];
  saveAppSettings: (title: string, logo?: File) => Promise<void>;
  goBack: () => void;
}

interface AdminPageState {
  titleSetting: AppSetting;
  logoSetting: AppSetting;
  logoFile?: File;
  documentTypes: DocumentType[];
  accounts: Account[];
  viewFeatures: ViewFeature[];
  coreFeatures: CoreFeature[];
  accountTypes: AccountType[];
  documentTypesColumnDefs: ColDef[];
  accountsColumnDefs: ColDef[];
  accountTypesColumnDefs: ColDef[];
  documentTypeSavedSuccess: boolean;
  documentTypeDeletedSuccess: boolean;
  accountSavedSuccess: boolean;
  accountDeletedSuccess: boolean;
  accountTypeSavedSuccess: boolean;
  accountTypeDeletedSuccess: boolean;
  viewFeatureOwnerSavedSuccess: boolean;
  viewFeatureHelperSavedSuccess: boolean;
  coreFeatureOwnerSavedSuccess: boolean;
  coreFeatureHelperSavedSuccess: boolean;
}

class AdminPage extends Component<AdminPageProps, AdminPageState> {
  documentTypesGridApi: GridApi;
  documentTypesGridColumnApi: ColumnApi;
  accountsGridApi: GridApi;
  accountsGridColumnApi: ColumnApi;
  accountTypesGridApi: GridApi;
  accountTypesGridColumnApi: ColumnApi;

  constructor(props: Readonly<AdminPageProps>) {
    super(props);
    const titleSetting = props.appSettings.find(
      (a) => a.settingName === SettingNameEnum.TITLE
    )
      ? props.appSettings.find((a) => a.settingName === SettingNameEnum.TITLE)!
      : { settingName: SettingNameEnum.TITLE, settingValue: '' };
    const logoSetting = props.appSettings.find(
      (a) => a.settingName === SettingNameEnum.LOGO
    )
      ? props.appSettings.find((a) => a.settingName === SettingNameEnum.LOGO)!
      : { settingName: SettingNameEnum.LOGO, settingValue: '' };
    this.state = {
      logoFile: undefined,
      titleSetting,
      logoSetting,
      documentTypes: [],
      accounts: [],
      viewFeatures: [],
      coreFeatures: [],
      accountTypes: [],
      documentTypesColumnDefs: [
        { headerName: 'Name', field: 'name', filter: true, editable: true },
        {
          headerName: 'Two Sided',
          field: 'isTwoSided',
          cellRenderer: 'checkboxCellRenderer',
        },
        {
          headerName: 'Expiration Date',
          field: 'hasExpirationDate',
          cellRenderer: 'checkboxCellRenderer',
        },
        {
          headerName: 'Protected',
          field: 'isProtectedDoc',
          cellRenderer: 'checkboxCellRenderer',
        },
        {
          headerName: 'Recordable',
          field: 'isRecordableDoc',
          cellRenderer: 'checkboxCellRenderer',
        },
        {
          headerName: 'Actions',
          field: 'action',
          sortable: false,
          cellRenderer: 'actionsCellRenderer',
        },
      ],

      accountsColumnDefs: [
        {
          headerName: 'Username',
          field: 'username',
          filter: true,
          editable: true,
        },
        {
          headerName: 'First Name',
          field: 'firstName',
          filter: true,
          editable: true,
        },
        {
          headerName: 'Last Name',
          field: 'lastName',
          filter: true,
          editable: true,
        },
        {
          headerName: 'Email',
          field: 'email',
          filter: true,
          editable: true,
        },
        {
          headerName: 'Actions',
          field: 'action',
          sortable: false,
          cellRenderer: 'actionsCellRenderer',
        },
      ],

      accountTypesColumnDefs: [
        { headerName: 'Title', field: 'accountTypeName', editable: true },
        {
          field: 'role',
          cellRenderer: 'roleCellRenderer',
          // cellEditor: 'agRichSelectCellEditor',
          cellEditorParams: {
            values: ['owner', 'helper'],
            cellRenderer: 'roleCellRenderer',
          },
          editable: true,
        },
        // NOTE: took out for now
        // { headerName: 'Admin Level', field: 'adminLevel' },
        {
          headerName: 'Actions',
          field: 'action',
          sortable: false,
          cellRenderer: 'actionsCellRenderer',
        },
      ],
      documentTypeSavedSuccess: false,
      documentTypeDeletedSuccess: false,
      accountSavedSuccess: false,
      accountDeletedSuccess: false,
      accountTypeSavedSuccess: false,
      accountTypeDeletedSuccess: false,
      viewFeatureOwnerSavedSuccess: false,
      viewFeatureHelperSavedSuccess: false,
      coreFeatureOwnerSavedSuccess: false,
      coreFeatureHelperSavedSuccess: false,
    };
  }

  async componentDidMount() {
    const { account } = { ...this.props };

    if (account.role === 'admin' || account.canAddOtherAccounts) {
      const adminResponse = await AdminService.getAdminInfo();

      const accountTypes = adminResponse.account.adminInfo.accountTypes
        .filter((accountType) => accountType.role !== 'admin')
        .map((accountType) => ({ ...accountType, action: '' }));

      let accountsColumnDefs = this.state.accountsColumnDefs;

      let toAdd = {
        headerName: 'Account Type',
        field: 'accountType',
        cellRenderer: 'accountTypeCellRenderer',
        cellRendererParams: { accountTypes: accountTypes },
        cellEditorParams: {
          cellRenderer: 'accountTypeCellRenderer',
        },
        editable: true,
      };

      accountsColumnDefs.unshift(toAdd);

      if (account.role === 'admin') {
        let toAddTwo = {
          headerName: 'CanAddOtherAccounts',
          field: 'canAddOtherAccounts',
          cellRenderer: 'checkboxCellRenderer',
        };
        accountsColumnDefs.unshift(toAddTwo);
      }

      this.accountsGridApi.setColumnDefs(accountsColumnDefs);

      this.setState({ accountsColumnDefs });
      this.setState({
        documentTypes: adminResponse.account.adminInfo.documentTypes.map(
          (documentType) => ({ ...documentType, action: '' })
        ),
        accounts: adminResponse.account.adminInfo.accounts
          .filter((account) => account.username !== 'admin')
          .map((account) => ({
            ...account,
            action: '',
          })),

        viewFeatures: adminResponse.account.adminInfo.viewFeatures,
        coreFeatures: adminResponse.account.adminInfo.coreFeatures,
        // NOTE: leaving out admin for now until further decisions made.
        accountTypes: accountTypes,
      });
    }
  }

  onAccountsGridReady = (params: GridOptions) => {
    this.accountsGridApi = params.api!;
    this.accountsGridColumnApi = params.columnApi!;
  };

  onDocumentTypesGridReady = (params: GridOptions) => {
    this.documentTypesGridApi = params.api!;
    this.documentTypesGridColumnApi = params.columnApi!;
  };

  onAccountTypesGridReady = (params: GridOptions) => {
    this.accountTypesGridApi = params.api!;
    this.accountTypesGridColumnApi = params.columnApi!;
  };

  onAccountTypeCellValueChanged = async (params: CellValueChangedEvent) => {
    let { accountTypes, accountTypeDeletedSuccess, accountTypeSavedSuccess } = {
      ...this.state,
    };
    if (params.value === 'save') {
      const reqObject = { ...params.data };
      delete reqObject.action;
      if (params.data._id) {
        await AdminService.updateAccountType(reqObject);
      } else {
        const newAccountType = (await AdminService.addAccountType(reqObject))
          .response;
        for (let i = 0; i < accountTypes.length; i++) {
          if (i === params.rowIndex) {
            accountTypes[i]._id = newAccountType._id;
          }
        }
      }
      accountTypeSavedSuccess = true;
    }
    if (params.value === 'delete') {
      let deleteId;
      accountTypes = accountTypes.filter((accountType, index) => {
        if (index === params.rowIndex && accountType._id) {
          deleteId = accountType._id;
        }
        return index !== params.rowIndex;
      });
      if (deleteId) {
        await AdminService.deleteAccountType(deleteId);
      }
      accountTypeDeletedSuccess = true;
    }
    this.setState(
      { accountTypes, accountTypeDeletedSuccess, accountTypeSavedSuccess },
      () => {
        this.accountTypesGridApi.setRowData(accountTypes);
        this.accountTypesGridApi.refreshCells();
        window.setTimeout(() => {
          this.setState({
            accountTypeDeletedSuccess: false,
            accountTypeSavedSuccess: false,
          });
        }, 2000);
      }
    );
  };

  onAccountTypeViewFeatureCellValueChanged = (
    params: CellValueChangedEvent
  ) => {
    const { accountTypes, viewFeatures } = { ...this.state };
    const data = params.data;
    const accountTypeName = params.colDef.field;
    const viewFeautureCheck = {
      featureDisplay: JSON.parse(params.value).label,
      isChecked: JSON.parse(params.value).isChecked,
    };
    for (const accountType of accountTypes) {
      if (accountType.accountTypeName === accountTypeName) {
        if (viewFeautureCheck.isChecked) {
          // then find it in viewfeatures and add it too the account type array
          for (const viewFeature of viewFeatures) {
            if (
              viewFeature.featureDisplay === viewFeautureCheck.featureDisplay
            ) {
              accountType.viewFeatures.push(viewFeature);
            }
          }
        } else {
          // then remove it from the account type array
          accountType.viewFeatures = accountType.viewFeatures.filter(
            (viewFeature) => {
              return (
                viewFeature.featureDisplay !== viewFeautureCheck.featureDisplay
              );
            }
          );
        }
      }
    }
    this.setState({ accountTypes });
  };

  onAccountTypeCoreFeatureCellValueChanged = (
    params: CellValueChangedEvent
  ) => {
    const { accountTypes, coreFeatures } = { ...this.state };
    const data = params.data;
    const accountTypeName = params.colDef.field;
    const coreFeautureCheck = {
      featureDisplay: JSON.parse(params.value).label,
      isChecked: JSON.parse(params.value).isChecked,
    };
    for (const accountType of accountTypes) {
      if (accountType.accountTypeName === accountTypeName) {
        if (coreFeautureCheck.isChecked) {
          for (const coreFeature of coreFeatures) {
            if (
              coreFeature.featureDisplay === coreFeautureCheck.featureDisplay
            ) {
              accountType.coreFeatures.push(coreFeature);
            }
          }
        } else {
          accountType.coreFeatures = accountType.coreFeatures.filter(
            (coreFeature) => {
              return (
                coreFeature.featureDisplay !== coreFeautureCheck.featureDisplay
              );
            }
          );
        }
      }
    }
    this.setState({ accountTypes });
  };

  onAccountCellValueChanged = async (params: CellValueChangedEvent) => {
    let { accounts, accountDeletedSuccess, accountSavedSuccess } = {
      ...this.state,
    };

    if (params.value === 'save') {
      const baseAccount = { ...params.data };
      const reqObjectSub = {};
      reqObjectSub['username'] = baseAccount.username;
      reqObjectSub['email'] = baseAccount.email;
      reqObjectSub['firstname'] = baseAccount.firstName;
      reqObjectSub['lastname'] = baseAccount.lastName;
      reqObjectSub['canAddOtherAccounts'] = baseAccount.canAddOtherAccounts;

      // TODO: Change to be dynamic based off selection!
      reqObjectSub['accounttype'] = baseAccount.accountType;
      reqObjectSub['password'] = baseAccount.email;

      // delete reqObject.action;
      const reqObject = { account: reqObjectSub };

      if (params.data.id !== '-') {
        await AdminService.updateAccount(params.data.id, reqObject);
      } else {
        const newAccount = await AdminService.addAccount(reqObject);
        for (let i = 0; i < accounts.length; i++) {
          if (i === params.rowIndex) {
            accounts[i].id = newAccount.id;
          }
        }
      }
      accountSavedSuccess = true;
    }
    if (params.value === 'delete') {
      let deleteId;
      accounts = accounts.filter((account, index) => {
        if (index === params.rowIndex && account.id) {
          deleteId = account.id;
        }
        return index !== params.rowIndex;
      });
      if (deleteId) {
        await AdminService.deleteAccount(deleteId);
      }
      accountDeletedSuccess = true;
    }
    this.setState(
      { accounts, accountDeletedSuccess, accountSavedSuccess },
      () => {
        this.accountsGridApi.setRowData(accounts);
        this.accountsGridApi.refreshCells();
        window.setTimeout(() => {
          this.setState({
            accountDeletedSuccess: false,
            accountSavedSuccess: false,
          });
        }, 2000);
      }
    );
  };

  onDocumentTypeCellValueChanged = async (params: CellValueChangedEvent) => {
    let {
      documentTypes,
      documentTypeDeletedSuccess,
      documentTypeSavedSuccess,
    } = { ...this.state };
    if (params.value === 'save') {
      const reqObject = { ...params.data };
      delete reqObject.action;
      if (params.data._id) {
        await AdminService.updatedDocumentType(reqObject);
      } else {
        const newDocType = (await AdminService.addNewDocumentType(reqObject))
          .savedDocType;
        for (let i = 0; i < documentTypes.length; i++) {
          if (i === params.rowIndex) {
            documentTypes[i]._id = newDocType._id;
          }
        }
      }
      documentTypeSavedSuccess = true;
    }
    if (params.value === 'delete') {
      try {
        let deleteId;
        // FIXME: Warning: unstable_flushDiscreteUpdates: Cannot flush updates when React is already rendering.
        // https://github.com/ag-grid/ag-grid/issues/3680
        documentTypes = documentTypes.filter((documentType, index) => {
          if (index === params.rowIndex && documentType._id) {
            deleteId = documentType._id;
          }
          return index !== params.rowIndex;
        });
        if (deleteId) {
          await AdminService.deleteDocumentType(deleteId);
        }
        documentTypeDeletedSuccess = true;
      } catch (err) {
        console.error('failed to delete document type');
      }
    }
    this.setState(
      { documentTypes, documentTypeDeletedSuccess, documentTypeSavedSuccess },
      () => {
        this.documentTypesGridApi.setRowData(documentTypes);
        this.documentTypesGridApi.refreshCells();
        window.setTimeout(() => {
          this.setState({
            documentTypeDeletedSuccess: false,
            documentTypeSavedSuccess: false,
          });
        }, 2000);
      }
    );
  };

  handleAddDocumentType = () => {
    const { documentTypes } = { ...this.state };
    documentTypes.push({
      name: '',
      isTwoSided: false,
      hasExpirationDate: false,
      isProtectedDoc: false,
      isRecordableDoc: false,
      action: '',
    });
    this.setState({ documentTypes }, () => {
      this.documentTypesGridApi.setRowData(documentTypes);
      this.documentTypesGridApi.refreshCells();
      // this.documentTypesGridApi.redrawRows();
    });
  };

  handleAddAccount = () => {
    const { accounts } = { ...this.state };
    accounts.push({
      username: 'Username',
      id: '-',
      email: 'email@email.com',
      accountType: 'Limited Owner',
      role: Role.owner,
      didAddress: '-',
      didPublicEncryptionKey: '-',
      token: '-',
      documents: [],
      shareRequests: [],
      profileImageUrl: 'default-profile-image.png',
      phoneNumber: 'Phone',
      organization: 'Org',
      firstName: 'First Name',
      lastName: 'Last Name',
      canAddOtherAccounts: false,
      adminInfo: '-',
      action: '',
    });
    this.setState({ accounts }, () => {
      this.accountsGridApi.setRowData(accounts);
      this.accountsGridApi.refreshCells();
      // this.documentTypesGridApi.redrawRows();
    });
  };

  handleAddAccountType = () => {
    const { accountTypes } = { ...this.state };
    accountTypes.push({
      // so that the feature tables don't crash with an empty column
      accountTypeName: `Helper Type #${accountTypes.length + 1}`,
      adminLevel: 2,
      coreFeatures: [],
      role: RoleType.HELPER,
      viewFeatures: [],
      action: '',
    });
    this.setState({ accountTypes }, () => {
      this.accountTypesGridApi.setRowData(accountTypes);
      this.accountTypesGridApi.refreshCells();
    });
  };

  handleSaveAllAccountTypes = async (isView?, isOwner?) => {
    let {
      viewFeatureOwnerSavedSuccess,
      viewFeatureHelperSavedSuccess,
      coreFeatureOwnerSavedSuccess,
      coreFeatureHelperSavedSuccess,
    } = { ...this.state };
    const { accountTypes } = { ...this.state };
    if (isOwner) {
      for (const accountType of accountTypes) {
        if (accountType.role === RoleType.OWNER) {
          await AdminService.updateAccountType(accountType);
        }
      }
      if (isView) {
        viewFeatureOwnerSavedSuccess = true;
      } else {
        coreFeatureOwnerSavedSuccess = true;
      }
    } else {
      for (const accountType of accountTypes) {
        if (accountType.role === RoleType.HELPER) {
          await AdminService.updateAccountType(accountType);
        }
      }
      if (isView) {
        viewFeatureHelperSavedSuccess = true;
      } else {
        coreFeatureHelperSavedSuccess = true;
      }
    }
    this.setState(
      {
        viewFeatureOwnerSavedSuccess,
        viewFeatureHelperSavedSuccess,
        coreFeatureOwnerSavedSuccess,
        coreFeatureHelperSavedSuccess,
      },
      () => {
        window.setTimeout(() => {
          this.setState({
            viewFeatureOwnerSavedSuccess: false,
            viewFeatureHelperSavedSuccess: false,
            coreFeatureOwnerSavedSuccess: false,
            coreFeatureHelperSavedSuccess: false,
          });
        }, 2000);
      }
    );
  };

  getAccountTypesViewFeatures = (accountTypes, viewFeatures) => {
    const accountTypeViewFeatures: any[] = [];
    for (const viewFeature of viewFeatures) {
      // rows
      // [{admin: 'true - gridView', cityAdministrator: 'true - gridView'}, ...]
      const accountTypeViewFeature = {};
      for (const accountType of accountTypes) {
        accountTypeViewFeature[accountType.accountTypeName] = '';
        const checkLabelItem = { isChecked: false, label: '' };
        if (
          accountType.viewFeatures.find(
            (accountViewFeature) =>
              accountViewFeature.featureName === viewFeature.featureName
          )
        ) {
          checkLabelItem.isChecked = true;
        } else {
          checkLabelItem.isChecked = false;
        }
        checkLabelItem.label = viewFeature.featureDisplay;
        accountTypeViewFeature[accountType.accountTypeName] = JSON.stringify(
          checkLabelItem
        );
      }
      accountTypeViewFeatures.push(accountTypeViewFeature);
    }
    return accountTypeViewFeatures;
  };

  getAccountTypesCoreFeatures = (accountTypes, coreFeatures) => {
    const accountTypeCoreFeatures: any[] = [];
    for (const coreFeature of coreFeatures) {
      const accountTypeCoreFeature = {};
      for (const accountType of accountTypes) {
        accountTypeCoreFeature[accountType.accountTypeName] = '';
        const checkLabelItem = { isChecked: false, label: '' };
        if (
          accountType.coreFeatures.find(
            (accountCoreFeature) =>
              accountCoreFeature.featureName === coreFeature.featureName
          )
        ) {
          checkLabelItem.isChecked = true;
        } else {
          checkLabelItem.isChecked = false;
        }
        checkLabelItem.label = coreFeature.featureDisplay;
        accountTypeCoreFeature[accountType.accountTypeName] = JSON.stringify(
          checkLabelItem
        );
      }
      accountTypeCoreFeatures.push(accountTypeCoreFeature);
    }
    return accountTypeCoreFeatures;
  };

  renderAppSettings() {
    const { logoSetting, titleSetting, logoFile } = { ...this.state };
    const { saveAppSettings } = { ...this.props };
    return (
      <Fragment>
        <h2>App Settings</h2>
        <h3>Logo</h3>
        {logoSetting.settingValue.length > 0 && (
          <div>
            <img
              style={{ height: '200px' }}
              // className="shared-with-image-single"
              src={AccountService.getProfileURL(logoSetting.settingValue)}
              alt="Profile"
            />
            <br />
            <input
              type="button"
              value="Change Logo"
              onClick={() => {
                this.setState({
                  logoSetting: {
                    settingName: SettingNameEnum.LOGO,
                    settingValue: '',
                  },
                });
              }}
            />
          </div>
        )}
        {logoSetting.settingValue.length < 1 && (
          <FileUploader
            setFile={(file?: File) => {
              this.setState({ logoFile: file });
            }}
          />
        )}
        <h3>Title</h3>
        <input
          type="text"
          value={titleSetting.settingValue}
          onChange={(e) => {
            const settingValue = e.target.value;
            this.setState({
              titleSetting: {
                settingName: SettingNameEnum.TITLE,
                settingValue,
              },
            });
          }}
        />
        <br />
        <br />
        <input
          type="button"
          value="Save App Settings"
          onClick={() => saveAppSettings(titleSetting.settingValue, logoFile)}
        />
        <br />
        <br />
      </Fragment>
    );
  }

  render() {
    const {
      accounts,
      accountsColumnDefs,
      documentTypes,
      documentTypesColumnDefs,
      accountTypesColumnDefs,
      viewFeatures,
      coreFeatures,
      accountTypes,
      accountSavedSuccess,
      accountDeletedSuccess,
      documentTypeSavedSuccess,
      documentTypeDeletedSuccess,
      accountTypeSavedSuccess,
      accountTypeDeletedSuccess,
      viewFeatureOwnerSavedSuccess,
      viewFeatureHelperSavedSuccess,
      coreFeatureOwnerSavedSuccess,
      coreFeatureHelperSavedSuccess,
    } = { ...this.state };

    // const accountTypeViewFeatures = [];
    // const accountTypeCoreFeaturesOwner = [];
    // const accountTypeCoreFeaturesHelper = [];
    const accountTypeViewFeatures = this.getAccountTypesViewFeatures(
      accountTypes,
      viewFeatures
    );
    const accountTypeCoreFeaturesOwner = this.getAccountTypesCoreFeatures(
      accountTypes.filter((accountType) => accountType.role === 'owner'),
      coreFeatures.filter((coreFeature) => coreFeature.featureRole === 'owner')
    );
    const accountTypeCoreFeaturesHelper = this.getAccountTypesCoreFeatures(
      accountTypes.filter((accountType) => accountType.role === 'helper'),
      coreFeatures.filter((coreFeature) => coreFeature.featureRole === 'helper')
    );
    return (
      <div className="admin-content" style={{ marginTop: '20px' }}>
        <h1>Admin Page</h1>
        {this.renderAppSettings()}
        <h2>Accounts</h2>
        <Alert color="success" isOpen={accountSavedSuccess}>
          Successfully Saved Account!
        </Alert>
        <Alert color="danger" isOpen={accountDeletedSuccess}>
          Successfully Deleted Account!
        </Alert>
        <div className="add-container">
          <AddSvg className="add" onClick={this.handleAddAccount} />
        </div>
        <div
          className="ag-theme-alpine-dark"
          style={{
            height:
              accounts.length > 0 ? `${accounts.length * 42 + 51}px` : '300px',
            width: '100%',
          }}
        >
          <AgGridReact
            columnDefs={accountsColumnDefs}
            rowData={accounts}
            frameworkComponents={{
              actionsCellRenderer: ActionsCellRenderer,
              accountTypeCellRenderer: AccountTypeCellRenderer,
              roleCellRenderer: RoleCellRenderer,
              checkboxCellRenderer: CheckboxCellRenderer,
            }}
            defaultColDef={{
              flex: 1,
              editable: false,
              resizable: true,
              sortable: true,
            }}
            onCellValueChanged={this.onAccountCellValueChanged}
            animateRows
            onGridReady={this.onAccountsGridReady}
            // domLayout="print"
          />
        </div>
        <br />

        <h2>Document Types</h2>
        <Alert color="success" isOpen={documentTypeSavedSuccess}>
          Successfully Saved Document Type!
        </Alert>
        <Alert color="danger" isOpen={documentTypeDeletedSuccess}>
          Successfully Deleted Document Type!
        </Alert>
        <div className="add-container">
          <AddSvg className="add" onClick={this.handleAddDocumentType} />
        </div>
        <div
          className="ag-theme-alpine-dark"
          style={{
            height:
              documentTypes.length > 0
                ? `${documentTypes.length * 42 + 51}px`
                : '300px',
            width: '100%',
          }}
        >
          <AgGridReact
            columnDefs={documentTypesColumnDefs}
            rowData={documentTypes}
            frameworkComponents={{
              checkboxCellRenderer: CheckboxCellRenderer,
              actionsCellRenderer: ActionsCellRenderer,
            }}
            defaultColDef={{
              flex: 1,
              editable: false,
              resizable: true,
              sortable: true,
            }}
            onCellValueChanged={this.onDocumentTypeCellValueChanged}
            animateRows
            onGridReady={this.onDocumentTypesGridReady}
            // domLayout="print"
          />
        </div>
        <br />

        <h2 className="account">Account Types</h2>
        <Alert color="success" isOpen={accountTypeSavedSuccess}>
          Successfully Saved Account Type!
        </Alert>
        <Alert color="danger" isOpen={accountTypeDeletedSuccess}>
          Successfully Deleted Account Type!
        </Alert>
        <div className="add-container" style={{ width: '650px' }}>
          <AddSvg className="add" onClick={this.handleAddAccountType} />
        </div>
        <div
          className="ag-theme-alpine-dark"
          style={{
            height:
              accountTypes.length > 0
                ? `${accountTypes.length * 42 + 51}px`
                : '300px',
            width: '650px',
          }}
        >
          <AgGridReact
            columnDefs={accountTypesColumnDefs}
            rowData={accountTypes}
            frameworkComponents={{
              actionsCellRenderer: ActionsCellRenderer,
              roleCellRenderer: RoleCellRenderer,
            }}
            defaultColDef={{
              flex: 1,
              editable: false,
              resizable: true,
              sortable: true,
            }}
            onCellValueChanged={this.onAccountTypeCellValueChanged}
            animateRows
            onGridReady={this.onAccountTypesGridReady}
            // domLayout="print"
          />
        </div>
        <br />

        <h2 className="view-feature-title">View Features</h2>
        <Alert color="success" isOpen={viewFeatureOwnerSavedSuccess}>
          Successfully Saved Account Types!
        </Alert>
        <h3>Owners</h3>
        <div className="save-container">
          <SaveSvg
            className="save"
            onClick={() => this.handleSaveAllAccountTypes(true, true)}
          />
        </div>
        <div
          className="ag-theme-alpine-dark"
          style={{
            height:
              viewFeatures.length > 0
                ? `${viewFeatures.length * 42 + 51}px`
                : '300px',
            width: '100%',
          }}
        >
          <AgGridReact
            columnDefs={accountTypes
              .filter((accountType) => accountType.role === 'owner')
              .map((accountType) => {
                return {
                  headerName: accountType.accountTypeName,
                  field: accountType.accountTypeName,
                  cellRenderer: 'checkboxNameCellRenderer',
                };
              })}
            rowData={accountTypeViewFeatures}
            frameworkComponents={{
              checkboxNameCellRenderer: CheckboxNameCellRenderer,
            }}
            defaultColDef={{
              flex: 1,
              editable: false,
              resizable: true,
              sortable: true,
            }}
            onCellValueChanged={this.onAccountTypeViewFeatureCellValueChanged}
            animateRows
            onGridReady={() => {}}
            // domLayout="print"
          />
        </div>
        <h3>Helpers</h3>
        <Alert color="success" isOpen={viewFeatureHelperSavedSuccess}>
          Successfully Saved Account Types!
        </Alert>
        <div className="save-container">
          <SaveSvg
            className="save"
            onClick={() => this.handleSaveAllAccountTypes(true, false)}
          />
        </div>
        <div
          className="ag-theme-alpine-dark"
          style={{
            height:
              viewFeatures.length > 0
                ? `${viewFeatures.length * 42 + 51}px`
                : '300px',
            width: '100%',
          }}
        >
          <AgGridReact
            columnDefs={accountTypes
              .filter((accountType) => accountType.role === 'helper')
              .map((accountType) => {
                return {
                  headerName: accountType.accountTypeName,
                  field: accountType.accountTypeName,
                  cellRenderer: 'checkboxNameCellRenderer',
                };
              })}
            rowData={accountTypeViewFeatures}
            frameworkComponents={{
              checkboxNameCellRenderer: CheckboxNameCellRenderer,
            }}
            defaultColDef={{
              flex: 1,
              editable: false,
              resizable: true,
              sortable: true,
            }}
            onCellValueChanged={this.onAccountTypeViewFeatureCellValueChanged}
            animateRows
            onGridReady={() => {}}
            // domLayout="print"
          />
        </div>
        <br />
        <h2 className="view-feature-title">Core Features</h2>
        <h3>Owners</h3>
        <Alert color="success" isOpen={coreFeatureOwnerSavedSuccess}>
          Successfully Saved Account Types!
        </Alert>
        <div className="save-container">
          <SaveSvg
            className="save"
            onClick={() => this.handleSaveAllAccountTypes(false, true)}
          />
        </div>
        <div
          className="ag-theme-alpine-dark"
          style={{
            height:
              coreFeatures.filter(
                (coreFeature) => coreFeature.featureRole === 'owner'
              ).length > 0
                ? `${
                    coreFeatures.filter(
                      (coreFeature) => coreFeature.featureRole === 'owner'
                    ).length *
                      42 +
                    51
                  }px`
                : '300px',
            width: '100%',
          }}
        >
          <AgGridReact
            columnDefs={accountTypes
              .filter((accountType) => accountType.role === 'owner')
              .map((accountType) => {
                return {
                  headerName: accountType.accountTypeName,
                  field: accountType.accountTypeName,
                  cellRenderer: 'checkboxNameCellRenderer',
                };
              })}
            rowData={accountTypeCoreFeaturesOwner}
            frameworkComponents={{
              checkboxNameCellRenderer: CheckboxNameCellRenderer,
            }}
            defaultColDef={{
              flex: 1,
              editable: false,
              resizable: true,
              sortable: true,
            }}
            onCellValueChanged={this.onAccountTypeCoreFeatureCellValueChanged}
            animateRows
            onGridReady={() => {}}
            // domLayout="print"
          />
        </div>
        <h3>Helpers</h3>
        <Alert color="success" isOpen={coreFeatureHelperSavedSuccess}>
          Successfully Saved Account Types!
        </Alert>
        <div className="save-container">
          <SaveSvg
            className="save"
            onClick={() => this.handleSaveAllAccountTypes(false, false)}
          />
        </div>
        <div
          className="ag-theme-alpine-dark"
          style={{
            height:
              coreFeatures.filter(
                (coreFeature) => coreFeature.featureRole === 'helper'
              ).length > 0
                ? `${
                    coreFeatures.filter(
                      (coreFeature) => coreFeature.featureRole === 'helper'
                    ).length *
                      42 +
                    51
                  }px`
                : '300px',
            width: '100%',
          }}
        >
          <AgGridReact
            columnDefs={accountTypes
              .filter((accountType) => accountType.role === 'helper')
              .map((accountType) => {
                return {
                  headerName: accountType.accountTypeName,
                  field: accountType.accountTypeName,
                  cellRenderer: 'checkboxNameCellRenderer',
                };
              })}
            rowData={accountTypeCoreFeaturesHelper}
            frameworkComponents={{
              checkboxNameCellRenderer: CheckboxNameCellRenderer,
            }}
            defaultColDef={{
              flex: 1,
              editable: false,
              resizable: true,
              sortable: true,
            }}
            onCellValueChanged={this.onAccountTypeCoreFeatureCellValueChanged}
            animateRows
            onGridReady={() => {}}
            // domLayout="print"
          />
        </div>
        <br />
      </div>
    );
  }
}

export default AdminPage;
