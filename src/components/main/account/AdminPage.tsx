import React, { Component } from 'react';
import Account from '../../../models/Account';
import AdminDocumentType from '../../admin/AdminDocumentType';
import AdminService from '../../../services/AdminService';
import './AdminPage.scss';
import CheckboxCellRenderer from '../../common/CheckboxCellRenderer';
import ActionsCellRenderer from '../../common/ActionsCellRenderer';

import { AgGridReact } from 'ag-grid-react';

interface AdminPageProps {
  account: Account;
  goBack: () => void;
}

class AdminPage extends Component<AdminPageProps> {
  state = {
    documentTypes: [],
    viewFeatures: [],
    accountTypes: [],
    documentTypesColumnDefs: [
      { headerName: 'Name', field: 'name', filter: true,  editable: true },
      { headerName: 'Two Sided', field: 'isTwoSided', cellRenderer: 'checkboxCellRenderer'},
      { headerName: 'Expiration Date', field: 'hasExpirationDate', cellRenderer: 'checkboxCellRenderer' },
      { headerName: 'Protected', field: 'isProtectedDoc', cellRenderer: 'checkboxCellRenderer' },
      { headerName: 'Recordable', field: 'isRecordableDoc', cellRenderer: 'checkboxCellRenderer' },
      { headerName: 'Actions', field: '_id', sortable: false, cellRenderer: 'actionsCellRenderer' },
    ],
  };

  constructor(props: Readonly<AdminPageProps>) {
    super(props);
  }

  async componentDidMount() {
    const { account } = {...this.props};
    if(account.role === 'admin') {
      const adminResponse = await AdminService.getAdminInfo();
      // console.log('Admin Response:');
      // console.log(adminResponse);
      this.setState({documentTypes: adminResponse.account.adminInfo.documentTypes,
        viewFeatures: adminResponse.account.adminInfo.viewFeatures,
        accountTypes: adminResponse.account.adminInfo.accountTypes,
      });
    }
  }

  async handleSubmitNewDocumentType(e) {
    e.preventDefault();

    const reqObject = {
      name: e.target.name.value,
      isTwoSided: e.target.isTwoSided.checked,
      hasExpirationDate: e.target.hasExpirationDate.checked,
      isProtectedDoc: e.target.isProtectedDoc.checked,
      isRecordableDoc: e.target.isRecordableDoc.checked,
    };

    await AdminService.addNewDocumentType(reqObject);
  }

  async handleDeleteDocumentType(id: any) {
    AdminService.deleteDocumentType(id);
  }

  onDoocumentTypeCellValueChanged = (params) => {
    debugger;
  };

  renderViewFeatures(viewFeatures) {
    const viewFeaturesArr = [] as any;

    for (const vf of viewFeatures) {
      viewFeaturesArr.push(
        <div key={vf._id} style={{ padding: '40px' }} className="col-lg-6">
          <p>{vf.featureName}</p>
        </div>
      );
    }

    return viewFeaturesArr;
  }

  renderAccountTypes(accountTypes) {
    const accountTypesArr = [] as any;

    for (const at of accountTypes) {
      let veiwFeaturesString = '';
      for (const vf of at.viewFeatures) {
        veiwFeaturesString += vf.featureName + ' - ';
      }

      accountTypesArr.push(
        <div key={at._id} style={{ padding: '40px' }} className="col-lg-6">
          <p>Name: {at.accountTypeName}</p>
          <p>Admin Level: {at.adminLevel}</p>
          <p>View Features: {veiwFeaturesString}</p>
        </div>
      );
    }

    return accountTypesArr;
  }

  renderDocuementTypes(documentTypes) {
    const docTypes = [] as any;

    for (const dt of documentTypes) {
      docTypes.push(
        <div key={dt._id} style={{ width: '400px', padding: '40px' }} className="col-lg-3">
          <AdminDocumentType
            key={dt.name}
            documentTypeName={dt.name}
            isTwoSided={dt.isTwoSided}
            hasExpirationDate={dt.hasExpirationDate}
            isProtectedDoc={dt.isProtectedDoc}
            isRecordableDoc={dt.isRecordableDoc}
            fields={dt.fields}
            edit={false}
            handleSubmitNewDocumentType={this.handleSubmitNewDocumentType}
            handleDeleteDocumentType={() =>
              this.handleDeleteDocumentType(dt._id)
            }
          ></AdminDocumentType>
        </div>
      );
    }

    // Add an editable one
    docTypes.push(
      <div key={'add-new'} style={{ width: '400px', padding: '40px' }} className="col-lg-3">
        <AdminDocumentType
          key="add-new-doctype"
          edit={true}
          handleSubmitNewDocumentType={this.handleSubmitNewDocumentType}
        ></AdminDocumentType>
      </div>
    );

    return docTypes;
  }

  render() {
    const { documentTypes, documentTypesColumnDefs, viewFeatures, accountTypes } = { ...this.state };
    return (
      <div className="admin-content" style={{ marginTop: '20px' }}>
        <h1> Admin Page </h1>
        <h2> Document Types </h2>
        <div
          className="ag-theme-alpine-dark"
          style={{
            height: documentTypes.length > 0 ? `${documentTypes.length*50}px` : '300px',
            width: '100%',
          }}
        >
          <AgGridReact
            columnDefs={documentTypesColumnDefs}
            rowData={documentTypes}
            frameworkComponents={{checkboxCellRenderer: CheckboxCellRenderer, actionsCellRenderer: ActionsCellRenderer}}
            defaultColDef={{
              flex: 1,
              editable: false,
              resizable: true,
              sortable: true
            }}
            onCellValueChanged={this.onDoocumentTypeCellValueChanged}
          />
        </div>
        <div className="row">{this.renderDocuementTypes(documentTypes)}</div>

        <h2> Account Types </h2>
        <div className="row">{this.renderAccountTypes(accountTypes)}</div>

        <h2> View Features </h2>
        <div className="row">{this.renderViewFeatures(viewFeatures)}</div>
      </div>
    );
  }
}

export default AdminPage;
