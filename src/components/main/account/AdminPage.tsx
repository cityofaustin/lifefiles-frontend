import React, { Component } from "react";
import Account from "../../../models/Account";
import AdminDocumentType from "../../admin/AdminDocumentType";
import AdminService from "../../../services/AdminService";

interface AdminPageProps {
  account: Account;
  goBack: () => void;
}

class AdminPage extends Component<AdminPageProps> {
  state = { documentTypes: [], viewFeatures: [], accountTypes: [] };
  constructor(props: Readonly<AdminPageProps>) {
    super(props);
  }

  async componentDidMount() {
    const adminResponse = await AdminService.getAdminInfo();
    console.log("Admin Response:");
    console.log(adminResponse);

    this.setState({
      documentTypes: adminResponse.account.adminInfo.documentTypes,
    });

    this.setState({
      viewFeatures: adminResponse.account.adminInfo.viewFeatures,
    });

    this.setState({
      accountTypes: adminResponse.account.adminInfo.accountTypes,
    });
  }

  async handleSubmitNewDocumentType(e) {
    e.preventDefault();

    let reqObject = {
      name: e.target.name.value,
      isTwoSided: e.target.isTwoSided.checked,
      hasExpirationDate: e.target.hasExpirationDate.checked,
      isProtectedDoc: e.target.isProtectedDoc.checked,
      isRecordableDoc: e.target.isRecordableDoc.checked,
    };

    await AdminService.addNewDocumentType(reqObject);
  }

  async handleDeleteDocumentType(id) {
    AdminService.deleteDocumentType(id);
  }

  renderViewFeatures(viewFeatures) {
    const viewFeaturesArr = [] as any;

    for (let vf of viewFeatures) {
      viewFeaturesArr.push(
        <div style={{ padding: "40px" }} className="col-lg-6">
          <p>{vf.featureName}</p>
        </div>
      );
    }

    return viewFeaturesArr;
  }

  renderAccountTypes(accountTypes) {
    const accountTypesArr = [] as any;

    for (let at of accountTypes) {
      let veiwFeaturesString = "";
      for (let vf of at.viewFeatures) {
        veiwFeaturesString += vf.featureName + " - ";
      }

      accountTypesArr.push(
        <div style={{ padding: "40px" }} className="col-lg-6">
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

    for (let dt of documentTypes) {
      docTypes.push(
        <div style={{ width: "400px", padding: "40px" }} className="col-lg-3">
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
      <div style={{ width: "400px", padding: "40px" }} className="col-lg-3">
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
    const { documentTypes, viewFeatures, accountTypes } = { ...this.state };
    return (
      <div className="main-content" style={{ marginTop: "20px" }}>
        <h1> Admin Page </h1>

        <h2> Document Types </h2>
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
