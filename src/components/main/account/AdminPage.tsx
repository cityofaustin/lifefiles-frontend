import React, { Component } from 'react';
import Account from '../../../models/Account';
import AdminDocumentType from '../../admin/AdminDocumentType';
import AdminService from '../../../services/AdminService';
import './AdminPage.scss';
import CheckboxCellRenderer from '../../common/CheckboxCellRenderer';
import CheckboxNameCellRenderer from '../../common/CheckboxNameCellRenderer';
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

interface AdminPageProps {
  account: Account;
  goBack: () => void;
}

interface AdminPageState {
  documentTypes: any[];
  viewFeatures: any;
  coreFeatures: any;
  accountTypes: any;
  documentTypesColumnDefs: ColDef[];
  // viewFeaturesColumnDefs: ColDef[];
  accountTypesColumnDefs: ColDef[];
  documentTypeSavedSuccess: boolean;
  documentTypeDeletedSuccess: boolean;
}

class AdminPage extends Component<AdminPageProps, AdminPageState> {
  documentTypesGridApi: GridApi;
  documentTypesGridColumnApi: ColumnApi;

  constructor(props: Readonly<AdminPageProps>) {
    super(props);
    this.state = {
      documentTypes: [],
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
      // viewFeaturesColumnDefs: [
      //   {
      //     headerName: 'View All Owners',
      //     field: 'ownerViewFeature',
      //     cellRenderer: 'checkboxNameCellRenderer',
      //   },
      //   {
      //     headerName: 'View All Helpers',
      //     field: 'helperViewFeature',
      //     cellRenderer: 'checkboxNameCellRenderer',
      //   },
      // ],
      accountTypesColumnDefs: [
        { headerName: 'Title', field: 'accountTypeName' },
        { headerName: 'Role', field: 'role' },
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
    };
  }

  async componentDidMount() {
    const { account } = { ...this.props };
    if (account.role === 'admin') {
      const adminResponse = await AdminService.getAdminInfo();
      // console.log('Admin Response:');
      // console.log(adminResponse);
      this.setState({
        documentTypes: adminResponse.account.adminInfo.documentTypes
        .map((documentType) => ({ ...documentType, action: '' })),
        viewFeatures: adminResponse.account.adminInfo.viewFeatures,
        coreFeatures: adminResponse.account.adminInfo.coreFeatures,
        // NOTE: leaving out admin for now until further decisions made.
        accountTypes: adminResponse.account.adminInfo.accountTypes
        .filter(accountType => accountType.role !== 'admin')
        .map(accountType => ({...accountType, action: ''})),
      });
    }
  }

  onDocumentTypesGridReady = (params: GridOptions) => {
    this.documentTypesGridApi = params.api!;
    this.documentTypesGridColumnApi = params.columnApi!;
  };

  async handleDeleteDocumentType(id: any) {}

  onDocumentTypeCellValueChanged = async (params: CellValueChangedEvent) => {
    let {
      documentTypes,
      documentTypeDeletedSuccess,
      documentTypeSavedSuccess,
    } = { ...this.state };
    if (params.value === 'save') {
      // TODO: add api call either update or create or delete
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

  getAccountTypesViewFeatures = (accountTypes, viewFeatures) => {
    const accountTypeViewFeatures: any[] = [];
    for (const viewFeature of viewFeatures) {
      // rows
      // [{admin: 'true - gridView', cityAdministrator: 'true - gridView'}, ...]
      const accountTypeViewFeature = {};
      for (const accountType of accountTypes) {
        accountTypeViewFeature[accountType.accountTypeName] = '';
        const checkLabelItem = { isChecked: false, label: '' };
        // debugger;
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

  render() {
    const {
      documentTypes,
      documentTypesColumnDefs,
      accountTypesColumnDefs,
      viewFeatures,
      coreFeatures,
      accountTypes,
      documentTypeSavedSuccess,
      documentTypeDeletedSuccess,
    } = { ...this.state };
    const accountTypeViewFeatures = this.getAccountTypesViewFeatures(
      accountTypes,
      viewFeatures
    );
    const accountTypeCoreFeaturesOwner = this.getAccountTypesCoreFeatures(
      accountTypes.filter(accountType => accountType.role === 'owner'),
      coreFeatures.filter(coreFeature => coreFeature.featureRole === 'owner')
    );
    const accountTypeCoreFeaturesHelper = this.getAccountTypesCoreFeatures(
      accountTypes.filter(accountType => accountType.role === 'helper'),
      coreFeatures.filter(coreFeature => coreFeature.featureRole === 'helper')
    );
    return (
      <div className="admin-content" style={{ marginTop: '20px' }}>
        <h1>Admin Page</h1>
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
        <p>
          * Don't delete all of the document types or the app won't work
          properly.
        </p>

        <h2 className="account">Account Types</h2>
        <div className="add-container" style={{width: '650px'}}>
          <AddSvg className="add" onClick={() => {}} />
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
              checkboxCellRenderer: CheckboxCellRenderer,
              actionsCellRenderer: ActionsCellRenderer,
            }}
            defaultColDef={{
              flex: 1,
              editable: false,
              resizable: true,
              sortable: true,
            }}
            onCellValueChanged={() => {}}
            animateRows
            onGridReady={() => {}}
            // domLayout="print"
          />
        </div>
        <br />
        <p>* TBD - needs edit</p>

        <h2 className="view-feature-title">
          View Features
        </h2>
        <h3>Owners</h3>
        <div className="save-container">
          <SaveSvg className="save" onClick={this.handleAddDocumentType} />
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
            columnDefs={accountTypes.filter(accountType => accountType.role === 'owner').map((accountType) => {
              return {
                headerName: accountType.accountTypeName,
                field: accountType.accountTypeName,
                cellRenderer: 'checkboxNameCellRenderer'
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
            onCellValueChanged={() => {}}
            animateRows
            onGridReady={() => {}}
            // domLayout="print"
          />
        </div>
        <h3>Helpers</h3>
        <div className="save-container">
          <SaveSvg className="save" onClick={this.handleAddDocumentType} />
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
            columnDefs={accountTypes.filter(accountType => accountType.role === 'helper').map((accountType) => {
              return {
                headerName: accountType.accountTypeName,
                field: accountType.accountTypeName,
                cellRenderer: 'checkboxNameCellRenderer'
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
            onCellValueChanged={() => {}}
            animateRows
            onGridReady={() => {}}
            // domLayout="print"
          />
        </div>
        <br />
        <p>* TBD - needs edit</p>
        <h2 className="view-feature-title">
          Core Features
        </h2>
        <h3>Owners</h3>
        <div className="save-container">
          <SaveSvg className="save" onClick={this.handleAddDocumentType} />
        </div>
        <div
          className="ag-theme-alpine-dark"
          style={{
            height:
              coreFeatures.filter(coreFeature => coreFeature.featureRole === 'owner').length > 0
                ? `${coreFeatures.filter(coreFeature => coreFeature.featureRole === 'owner').length * 42 + 51}px`
                : '300px',
            width: '100%',
          }}
        >
          <AgGridReact
            columnDefs={accountTypes.filter(accountType => accountType.role === 'owner').map((accountType) => {
              return {
                headerName: accountType.accountTypeName,
                field: accountType.accountTypeName,
                cellRenderer: 'checkboxNameCellRenderer'
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
            onCellValueChanged={() => {}}
            animateRows
            onGridReady={() => {}}
            // domLayout="print"
          />
        </div>
        <h3>Helpers</h3>
        <div className="save-container">
          <SaveSvg className="save" onClick={this.handleAddDocumentType} />
        </div>
        <div
          className="ag-theme-alpine-dark"
          style={{
            height:
              coreFeatures.filter(coreFeature => coreFeature.featureRole === 'helper').length > 0
                ? `${coreFeatures.filter(coreFeature => coreFeature.featureRole === 'helper').length * 42 + 51}px`
                : '300px',
            width: '100%',
          }}
        >
          <AgGridReact
            columnDefs={accountTypes.filter(accountType => accountType.role === 'helper').map((accountType) => {
              return {
                headerName: accountType.accountTypeName,
                field: accountType.accountTypeName,
                cellRenderer: 'checkboxNameCellRenderer'
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
            onCellValueChanged={() => {}}
            animateRows
            onGridReady={() => {}}
            // domLayout="print"
          />
        </div>
        <br />
        <p>* TBD - needs edit</p>
      </div>
    );
  }
}

export default AdminPage;
