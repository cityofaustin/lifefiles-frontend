import React, { ChangeEvent, Component, Fragment } from 'react';
import {
  Button,
  Col,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from 'reactstrap';
import classNames from 'classnames';
import Document from '../../../models/document/Document';
import './UpdateDocumentModal.scss';
import DocumentService from '../../../services/DocumentService';
import { ReactComponent as DeleteSvg } from '../../../img/delete.svg';
import { ReactComponent as DeleteSvg2 } from '../../../img/delete-unbound.svg';
import { ReactComponent as EditDocSvg } from '../../../img/edit-doc.svg';
import { ReactComponent as EditDocSmSvg } from '../../../img/edit-doc-sm.svg';
import { ReactComponent as CrossSvg } from '../../../img/cross2.svg';
import { ReactComponent as CrossSmSvg } from '../../../img/cross2-sm.svg';
import FileUploader from '../../common/FileUploader';
// import { ReactComponent as DownloadBtnSvg } from '../../../img/download-btn.svg';
import { ReactComponent as DownloadSvg } from '../../../img/download2.svg';
import { ReactComponent as PrintSvg } from '../../../img/print2.svg';
// import { ReactComponent as ZoomBtnSvg } from '../../../img/zoom-btn.svg';
import { ReactComponent as ZoomSvg } from '../../../img/zoom.svg';
import { ReactComponent as ZoomBtnSmSvg } from '../../../img/zoom-btn-sm.svg';
import { ReactComponent as NotSharedDoc } from '../../../img/not-shared-doc.svg';
import Lightbox from 'react-image-lightbox';
import Account from '../../../models/Account';
import AccountImpl from '../../../models/AccountImpl';
import { format, isThisISOWeek } from 'date-fns';
import MSelect from '../../common/MSelect';
import ShareRequest, {
  ShareRequestPermission,
} from '../../../models/ShareRequest';
import ShareRequestService, {
  ShareRequestPermissions,
} from '../../../services/ShareRequestService';
import UpdateDocumentRequest from '../../../models/document/UpdateDocumentRequest';
import ShareDocWithContainer from './ShareDocWithContainer';
import StringUtil from '../../../util/StringUtil';
import ZipUtil from '../../../util/ZipUtil';
import CryptoUtil from '../../../util/CryptoUtil';
import NotaryUtil from '../../../util/NotaryUtil';
import ImageWithStatus, { ImageViewTypes } from '../../common/ImageWithStatus';
import AccountService from '../../../services/AccountService';
import NotaryService from '../../../services/NotaryService';
import FileBase64 from 'react-file-base64';
import DatePicker from 'react-datepicker';
import { OptionTypeBase } from 'react-select';
import ImageUtil from '../../../util/ImageUtil';
import PdfPreview from '../../common/PdfPreview';
import ProgressIndicator from '../../common/ProgressIndicator';
import APIService from '../../../services/APIService';

import rskapi from 'rskapi';
import Web3 from 'web3';
import QRCode from 'qrcode.react';
import Badge from '../../common/Badge';
import { ReactComponent as StampSvg } from '../../../img/stamp.svg';
import ProfileImage, { ProfileImageSizeEnum } from '../../common/ProfileImage';
import DocumentType from '../../../models/DocumentType';
import Role from '../../../models/Role';
import SharedWith from './SharedWith';

const CONTRACT_DEFAULT_GAS = 300000;
const rskClient = rskapi.client('https://public-node.rsk.co:443'); // rsk mainnet public node
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    'https://mainnet.infura.io/v3/f89f8f95ce6c4199849037177b155d08'
  )
);

interface UpdateDocumentModalProps {
  showModal: boolean;
  toggleModal: () => void;
  documentTypes: DocumentType[];
  document?: Document;
  handleDeleteDocument: (document: Document) => Promise<void>;
  shareRequests: ShareRequest[];
  accounts: Account[];
  addShareRequest: (request: ShareRequest) => void;
  removeShareRequest: (request: ShareRequest) => void;
  myAccount: Account;
  handleUpdateDocument: (request: UpdateDocumentRequest) => void;
  handleUpdateDocumentAndUpdateShareRequests: (
    request: UpdateDocumentRequest
  ) => void;
  privateEncryptionKey?: string;
  referencedAccount?: Account;
  handleClientSelected: (otherOwnerAccount: Account) => void; // to refresh the share request data
  activeTab: string;
}

interface UpdateDocumentModalState {
  rskGasPrice: number;
  ethGasPrice: number;
  adminPublicKey: string;
  currentBtcPrice: number;
  currentEthPrice: number;
  networkSelect: string;
  activeTab: string;
  showConfirmDeleteSection: boolean;
  hasConfirmedDelete: boolean;
  deleteConfirmInput: string;
  isZoomed: boolean;
  selectedContact?: Account;
  showConfirmShare: boolean;
  newFile?: File;
  newThumbnailFile?: File;
  base64Image?: string;
  base64Thumbnail?: string;
  base64Pdf?: string;
  docType?: string;
  pendingAccess: boolean;
  notaryId: string;
  notarySealBase64: string;
  privatePem: string;
  publicPem: string;
  notarizationType: string;
  validUntilDate: Date;
  vc?: string;
  vp?: string;
  approvedVpUrl?: string;
  doc?: any;
  isLoading: boolean;
  updatedBase64Image?: string;
  gotNotarizationInfo: boolean;
  width: number;
}

class UpdateDocumentModal extends Component<
  UpdateDocumentModalProps,
  UpdateDocumentModalState
> {
  previewPadding = '0 30px';

  constructor(props: Readonly<UpdateDocumentModalProps>) {
    super(props);

    this.state = {
      rskGasPrice: 1000000000,
      ethGasPrice: 1000000000,
      adminPublicKey: '',
      currentBtcPrice: 0,
      currentEthPrice: 0,
      networkSelect: 's3',
      activeTab: props.activeTab,
      showConfirmDeleteSection: false,
      hasConfirmedDelete: false,
      deleteConfirmInput: '',
      isZoomed: false,
      showConfirmShare: false,
      base64Image: undefined,
      base64Thumbnail: undefined,
      base64Pdf: undefined,
      docType: undefined,
      pendingAccess: false,
      notaryId: '',
      notarySealBase64: '',
      privatePem: '',
      publicPem: '',
      notarizationType: '',
      validUntilDate: new Date(),
      vc: undefined,
      vp: undefined,
      doc: undefined,
      isLoading: false,
      updatedBase64Image: undefined,
      gotNotarizationInfo: false,
      width: 0,
    };
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    this.setImage();
  }

  componentDidUpdate(prevProps: Readonly<UpdateDocumentModalProps>) {
    if (prevProps.activeTab !== this.props.activeTab) {
      this.setState({ activeTab: this.props.activeTab });
    }
    if (prevProps.document !== this.props.document) {
      this.setImage();
      if (
        this.props.myAccount.role === 'owner' &&
        this.props.document?.vcJwt!
      ) {
        this.getNotarizationInfo();
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    this.setState({ width: window.innerWidth });
  };

  getNotarizationInfo = async () => {
    if (this.state.gotNotarizationInfo == false) {
      this.setState({ gotNotarizationInfo: true });

      if (this.state.adminPublicKey === '') {
        const rskGasPrice = await rskClient.host().getGasPrice();
        const ethGasPrice = web3.utils.toWei(
          '' + (await NotaryService.getEthGasPrice()) / 10,
          'gwei'
        );

        const adminPublicKeyResponse = await NotaryService.getAdminPublicKey();
        const currentBtcPrice = await NotaryService.getCoinPrice('bitcoin');
        const currentEthPrice = await NotaryService.getCoinPrice('ethereum');

        this.setState({ ethGasPrice: parseInt(ethGasPrice) });
        this.setState({ rskGasPrice });

        if (
          adminPublicKeyResponse == undefined ||
          adminPublicKeyResponse == null
        ) {
          this.setState({ adminPublicKey: '-' });
        } else {
          this.setState({
            adminPublicKey: adminPublicKeyResponse.adminPublicKey,
          });
        }

        this.setState({ currentBtcPrice });
        this.setState({ currentEthPrice });
      }
    }
  };

  setImage = async () => {
    let base64Pdf: string | undefined;
    let base64Image: string | undefined;
    let base64Thumbnail: string | undefined;
    let docType: string | undefined;
    if (
      this.props.document &&
      this.props.privateEncryptionKey &&
      this.props.document.url.length > 0
    ) {
      try {
        const encryptedThumbnail = await ZipUtil.unzip(
          DocumentService.getDocumentURL(this.props.document.thumbnailUrl)
        );
        base64Thumbnail = await CryptoUtil.getDecryptedString(
          this.props.privateEncryptionKey,
          encryptedThumbnail
        );
        this.setState({ base64Thumbnail }); // do this since it's much quicker than the pdf.
        docType = this.props.document.type;
        const encryptedString = await ZipUtil.unzip(
          DocumentService.getDocumentURL(this.props.document.url)
        );
        const base64 = await CryptoUtil.getDecryptedString(
          this.props.privateEncryptionKey,
          encryptedString
        );
        if (base64.startsWith('data:application/pdf')) {
          base64Pdf = base64;
        } else {
          base64Image = base64;
        }
      } catch (err) {
        console.error(err);
      }
    }
    this.setState({ base64Image, docType, base64Pdf, base64Thumbnail });
  };

  toggleModal = () => {
    // clear state
    const { toggleModal } = { ...this.props };
    this.setState({
      activeTab: '1',
      showConfirmDeleteSection: false,
      hasConfirmedDelete: false,
      deleteConfirmInput: '',
      isZoomed: false,
      selectedContact: undefined,
      showConfirmShare: false,
      base64Image: undefined,
      base64Pdf: undefined,
      pendingAccess: false,
    });
    toggleModal();
  };

  handleChangeNetworkSelect = (e) => {
    this.setState({ networkSelect: e.target.value });
  };

  handleUpdateDocument = () => {
    const { newFile, newThumbnailFile, updatedBase64Image } = { ...this.state };
    const { handleUpdateDocumentAndUpdateShareRequests, document, referencedAccount } = {
      ...this.props,
    };
    // document doesn't have id
    handleUpdateDocumentAndUpdateShareRequests({
      id: document!._id !== undefined ? document!._id! : document!.id!,
      img: newFile,
      thumbnail: newThumbnailFile,
      validUntilDate: undefined, // FIXME: add expired at form somewhere
      base64Image: updatedBase64Image!,
      shareRequestId: (document as any).shareRequestId,
      referencedAccount
    });
    // clear state
    this.setState({
      activeTab: '1',
      showConfirmDeleteSection: false,
      hasConfirmedDelete: false,
      deleteConfirmInput: '',
      isZoomed: false,
      selectedContact: undefined,
      showConfirmShare: false,
      base64Image: undefined,
    });
  };

  handleClaim = async () => {
    const { handleUpdateDocument, document } = { ...this.props };
    this.setState({ isLoading: true });
    if (document?.vcJwt) {
      try {
        await this.handleOwnerAcceptNotarization();
      } catch (err) {
        console.error('Failed to add vp');
      }
    }
    try {
      await handleUpdateDocument({
        id: document!._id!,
        img: undefined,
        thumbnail: undefined,
        validUntilDate: undefined, // FIXME: add expired at form somewhere
        claimed: true,
      });
    } catch (err) {
      console.error('Failed to update document');
    }
    // clear state
    this.setState({
      activeTab: '1',
      showConfirmDeleteSection: false,
      hasConfirmedDelete: false,
      deleteConfirmInput: '',
      isZoomed: false,
      selectedContact: undefined,
      showConfirmShare: false,
      base64Image: undefined,
      isLoading: false,
    });
  };

  handleNotarizationTypeChange = (documentTypeOption: OptionTypeBase) => {
    const notarizationType = documentTypeOption.value;
    this.setState({ notarizationType });
  };

  handleNotaryIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    this.setState({ notaryId: value });
  };

  handleNotaryUploadNewSeal = (file: any) => {
    const notarySealBase64 = file.base64;
    ImageUtil.processImageBase64(notarySealBase64);
    this.setState({ notarySealBase64 });
  };

  handleNotaryUploadPem = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = async (ev) => {
      let privatePem = '' as any;
      privatePem = ev?.target?.result;
      const publicPem = NotaryUtil.getPublicKeyFromPrivateKey(privatePem);
      this.setState({ privatePem });
      this.setState({ publicPem });
    };
    if (e.target.files !== null) {
      reader.readAsText(e.target.files[0]);
    }
  };

  handleOwnerAcceptNotarization = async () => {
    const vpJwt = await NotaryUtil.createVP(
      this.props.myAccount.didAddress,
      this.props.privateEncryptionKey!,
      this.props.document?.vcJwt!,
      this.props.document?.vpDocumentDidAddress!
    );

    const document = { ...this.props.document! };
    document.vpJwt = vpJwt;
    NotaryService.updateDocumentVP(
      (document.belongsTo as unknown) as string,
      document.type,
      document.vpJwt
    );
    const receipt = await NotaryService.anchorVpToBlockchain(
      vpJwt,
      this.state.networkSelect
    );
    console.log({ receipt });
    this.setState({ approvedVpUrl: receipt.didStatus });
    this.setState({ vp: vpJwt });
  };

  isRecordable = () => {
    const { document, documentTypes } = { ...this.props };
    return !!documentTypes.find((dt) => dt.name === document!.type)
      ?.isRecordableDoc;
  };

  handleNotarizeDocument = async () => {
    const { document, referencedAccount, myAccount } = { ...this.props };

    const notarizedDoc = await NotaryUtil.createNotarizedDocument(
      'certifiedCopy',
      // this.state.notarizationType,
      this.state.validUntilDate,
      parseInt(this.state.notaryId, 10),
      this.props.myAccount.didAddress,
      this.props.privateEncryptionKey === undefined
        ? ''
        : this.props.privateEncryptionKey,
      this.state.publicPem,
      this.state.privatePem,
      this.props.referencedAccount?.didAddress === undefined
        ? ''
        : this.props.referencedAccount?.didAddress,
      this.state.base64Image === undefined ? '' : this.state.base64Image,
      this.state.notarySealBase64,
      document?.type!,
      AccountImpl.displayName(referencedAccount),
      AccountImpl.getFullName(myAccount.firstName, myAccount.lastName),
      'Travis',
      this.isRecordable()
    );

    // await NotaryService.updateDocumentVC(
    //   this.props.referencedAccount?.id!,
    //   this.state.docType!,
    //   notarizedDoc!.vc
    // );

    this.setState({ vc: notarizedDoc!.vc });
    this.setState({ doc: notarizedDoc!.doc });
  };

  handleShareDocWithContact = async (permissions) => {
    const { document, addShareRequest, myAccount, removeShareRequest } = {
      ...this.props,
    };
    const { selectedContact, base64Image, base64Pdf, base64Thumbnail } = {
      ...this.state,
    };
    this.setState({ isLoading: true });
    // then add share and approve it api call
    try {
      if (selectedContact && (base64Image || base64Pdf)) {
        const encryptionPublicKey = selectedContact.didPublicEncryptionKey!;
        const dataUrl = base64Image ? base64Image : base64Pdf;
        // const file: File = StringUtil.dataURLtoFile(dataUrl!, 'original');
        // const base64Thumbnail = await StringUtil.fileContentsToThumbnail(file);
        const encryptedString = await CryptoUtil.getEncryptedByPublicString(
          encryptionPublicKey!,
          dataUrl!
        );
        const encryptedThumbnail = await CryptoUtil.getEncryptedByPublicString(
          encryptionPublicKey!,
          base64Thumbnail!
        );
        const zipped: Blob = await ZipUtil.zip(encryptedString);
        const zippedThumbnail: Blob = await ZipUtil.zip(encryptedThumbnail);
        const newZippedFile = new File([zipped], 'encrypted-image.zip', {
          type: 'application/zip',
          lastModified: Date.now(),
        });
        const newZippedThumbnailFile = new File(
          [zippedThumbnail],
          'encrypted-image-thumbnail.zip',
          {
            type: 'application/zip',
            lastModified: Date.now(),
          }
        );
        if (
          this.getDocumentSharedWithContact(selectedContact) &&
          this.getDocumentSharedWithContact(selectedContact)?.approved === false
        ) {
          const approvedShareRequest = await ShareRequestService.approveShareRequestFile(
            newZippedFile,
            newZippedThumbnailFile,
            this.getDocumentSharedWithContact(selectedContact)!._id!,
            permissions
          );
          // update the existing shareRequest with this approved one.
          removeShareRequest(
            this.getDocumentSharedWithContact(selectedContact)!
          );
          addShareRequest(approvedShareRequest);
        } else {
          const newShareRequest = await ShareRequestService.addShareRequestFile(
            newZippedFile,
            newZippedThumbnailFile,
            document?.type!,
            myAccount.id,
            selectedContact?.id!,
            permissions
          );
          addShareRequest(newShareRequest);
        }
      }
    } catch (err) {
      console.error(err.message);
    }
    // Note: you don't need to approve anymore since your the owner
    // newShareRequest = await ShareRequestService.approveShareRequest(newShareRequest._id);
    this.setState({
      selectedContact,
      showConfirmShare: false,
      isLoading: false,
    });
  };

  handleShareDocCheck = async (permissions: ShareRequestPermissions) => {
    const { removeShareRequest } = { ...this.props };
    const { selectedContact } = { ...this.state };
    // let showConfirmShare = false;
    if (this.getDocumentSharedWithContact(selectedContact!)) {
      // const sr = this.getDocumentSharedWithContact(selectedContact!);
      if (
        !permissions.canDownload &&
        !permissions.canReplace &&
        !permissions.canView
      ) {
        try {
          await ShareRequestService.deleteShareRequest(
            this.getDocumentSharedWithContact(selectedContact!)!._id!
          );
          removeShareRequest(
            this.getDocumentSharedWithContact(selectedContact!)!
          );
        } catch (err) {
          console.error(err.message);
        }
      } else {
        const sr = this.getDocumentSharedWithContact(selectedContact!)!;
        if (sr.approved === false) {
          await this.handleShareDocWithContact(permissions);
        }
        // just updating permissions then
        sr.canView = permissions.canView;
        sr.canReplace = permissions.canReplace;
        sr.canDownload = permissions.canDownload;
        await ShareRequestService.updateShareRequestPermissions(sr);
      }
    } else {
      this.handleShareDocWithContact(permissions);
      // show prompt
      // showConfirmShare = true;
    }
    this.setState({
      selectedContact,
      // showConfirmShare
    });
  };

  toggleConfirmShare = () => {
    const { showConfirmShare } = { ...this.state };
    this.setState({ showConfirmShare: !showConfirmShare });
  };

  toggleTab = (tab: string) => {
    const { activeTab } = { ...this.state };
    if (activeTab !== tab)
      this.setState({
        activeTab: tab,
        showConfirmDeleteSection: false,
        pendingAccess: false,
      });
  };

  handleDeleteDocument = async (document: Document) => {
    const { handleDeleteDocument } = { ...this.props };
    try {
      await handleDeleteDocument(document);
      this.setState({
        activeTab: '1',
        showConfirmDeleteSection: false,
        hasConfirmedDelete: false,
        deleteConfirmInput: '',
        isZoomed: false,
        selectedContact: undefined,
        showConfirmShare: false,
        base64Image: undefined,
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  handleDeleteConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    let hasConfirmedDelete = false;
    if (value === 'DELETE') {
      hasConfirmedDelete = true;
    }
    this.setState({ deleteConfirmInput: value, hasConfirmedDelete });
  };

  setFile = (newFile: File, newThumbnailFile: File) => {
    this.setState({ newFile, newThumbnailFile });
  };

  setUpdatedBase64Image = (updatedBase64Image) => {
    this.setState({ updatedBase64Image });
  };

  printImg(url: string) {
    const win = window.open('');
    win?.document.write(
      '<img src="' + url + '" onload="window.print();window.close()" />'
    );
    win?.focus();
  }

  openPdfWindow(url: string) {
    const win = window.open('');
    win?.document.write(
      '<embed type="application/pdf" src="' +
        url +
        '" id="pdfDocument" width="100%" height="100%" />'
    );
    win?.focus();
  }

  getDocumentSharedWithContact = (selectedContact: Account) => {
    // const { selectedContact } = { ...this.state };
    const { shareRequests } = { ...this.props };
    const shareRequestMatch = shareRequests.find(
      (shareRequest) => selectedContact?.id === shareRequest.shareWithAccountId
    );
    if (shareRequestMatch) {
      return shareRequestMatch;
    }
    return undefined;
  };

  handleSelectContact = (selectedContact: Account) => {
    this.setState({ selectedContact });
  };

  handleRequestAccess = async () => {
    const { myAccount, referencedAccount, document, handleClientSelected } = {
      ...this.props,
    };
    await ShareRequestService.addShareRequestFile(
      undefined,
      undefined,
      document!.type,
      referencedAccount!.id,
      myAccount.id,
      { canView: false, canReplace: false, canDownload: false }
    );
    // set this in main container
    handleClientSelected(referencedAccount!);
    this.setState({ pendingAccess: true });
  };

  isAllowedShareRequestPermission = (srp: ShareRequestPermission) => {
    const {
      myAccount,
      // viewFeature, // NOTE: should handle admin view feature too.
      shareRequests,
      document,
    } = { ...this.props };
    let isAllowed = true;
    if (myAccount.role === Role.helper) {
      try {
        const shareRequest = shareRequests.find(
          (sr) => sr.documentType === document?.type
        );
        isAllowed = shareRequest ? shareRequest[srp] : true;
      } catch (err) {
        console.error('Unabled to get share request');
      }
    }
    return isAllowed;
  };

  renderNotShared() {
    const { document } = { ...this.props };
    const { pendingAccess } = { ...this.state };
    return (
      <Fragment>
        {document && (
          <div className="share-request">
            <div className="file-container">
              <NotSharedDoc />
              <div className="file-info">
                <div className="attr">File</div>
                <div className="value">{document.type}</div>
                <div className="attr">Upload Date</div>
                <div className="value">{document.updatedAt || '-'}</div>
                <div className="attr">Upload By</div>
                <div className="value">{document.uploadedBy || '-'}</div>
                <div className="attr">Valid Until</div>
                <div className="value">{document.validUntilDate || '-'}</div>
              </div>
            </div>
            <div className="request-access">
              <button
                className="button"
                onClick={this.handleRequestAccess}
                disabled={
                  pendingAccess || document.sharedWithAccountIds.length > 0
                }
              >
                {pendingAccess || document.sharedWithAccountIds.length > 0
                  ? 'Access Pending'
                  : 'Request Access'}
              </button>
            </div>
          </div>
        )}
      </Fragment>
    );
  }

  renderModalHeader() {
    const { document, referencedAccount } = { ...this.props };
    return (
      <Fragment>
        {referencedAccount && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!referencedAccount.profileImageUrl && (
              <div style={{ marginRight: '28.3px' }}>
                <ProfileImage
                  account={referencedAccount}
                  size={ProfileImageSizeEnum.SMALL}
                />
              </div>
            )}
            {referencedAccount.profileImageUrl && (
              <img
                src={AccountService.getProfileURL(
                  referencedAccount.profileImageUrl!
                )}
                alt=""
              />
            )}
            <span className="update-doc-title">
              {AccountImpl.hasNameSet(referencedAccount) &&
                AccountImpl.getFullName(
                  referencedAccount.firstName,
                  referencedAccount.lastName
                )}
              {!AccountImpl.hasNameSet(referencedAccount) &&
                referencedAccount.username}{' '}
              - {document?.type}
            </span>
          </div>
        )}
        {!referencedAccount && (
          <Fragment>
            <EditDocSvg className="lg" />
            <EditDocSmSvg className="sm" />
            <span>{document?.type}</span>
          </Fragment>
        )}
      </Fragment>
    );
  }

  renderNav() {
    const { referencedAccount, shareRequests } = { ...this.props };
    const { activeTab, showConfirmDeleteSection } = { ...this.state };
    return (
      <Fragment>
        {!referencedAccount && (
          <div
            className={classNames({
              'upload-doc-delete-container': true,
              active: showConfirmDeleteSection,
            })}
          >
            <div
              className="delete-nav-container"
              onClick={() =>
                this.setState({
                  showConfirmDeleteSection: !showConfirmDeleteSection,
                })
              }
            >
              <DeleteSvg2 className="delete-svg" />
            </div>
            {showConfirmDeleteSection && this.renderConfirmDelete()}
          </div>
        )}
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classNames({ active: activeTab === '1' })}
              onClick={() => {
                this.toggleTab('1');
              }}
            >
              Preview
            </NavLink>
          </NavItem>
          {this.isAllowedShareRequestPermission(
            ShareRequestPermission.CAN_REPLACE
          ) && (
            <NavItem>
              <NavLink
                className={classNames({ active: activeTab === '2' })}
                onClick={() => {
                  this.toggleTab('2');
                }}
              >
                Replace
              </NavLink>
            </NavItem>
          )}
          {!referencedAccount && (
            <NavItem style={{ position: 'relative' }}>
              {shareRequests.find((sr) => !sr.approved) && (
                <div
                  style={{
                    right: '0',
                    top: '-12px',
                    position: 'absolute',
                  }}
                >
                  <Badge />
                </div>
              )}
              <NavLink
                className={classNames({ active: activeTab === '3' })}
                onClick={() => {
                  this.toggleTab('3');
                }}
              >
                Share
              </NavLink>
            </NavItem>
          )}
        </Nav>
      </Fragment>
    );
  }

  renderPreviewTab() {
    const { document, referencedAccount } = { ...this.props };
    return (
      <Fragment>
        <Row>
          {document && (
            <Col sm="12" className="preview-container">
              <Row>
                {this.isAllowedShareRequestPermission(
                  ShareRequestPermission.CAN_VIEW
                ) && (
                  <Col md={12} lg={6} style={{ padding: this.previewPadding }}>
                    <div className="preview-img-container">
                      {this.renderImageOrPDF()}
                    </div>
                  </Col>
                )}
                {this.renderPreviewInfo()}
              </Row>
              {this.renderImageAccessSmall()}
              {this.renderImageAccess()}
              {this.renderPreviewInfoSmall()}
            </Col>
          )}
        </Row>
        {!referencedAccount && this.renderDeleteSmall()}
      </Fragment>
    );
  }

  renderImageOrPDF() {
    const { document } = { ...this.props };
    const { base64Image, base64Pdf, width } = { ...this.state };
    let pdfHeight = 200;
    if (width < 576) {
      pdfHeight = 200;
    }
    if (width >= 576) {
      pdfHeight = 220;
    }
    if (width >= 1200) {
      pdfHeight = 340;
    }
    return (
      <div className="img-section">
        {document!.vcJwt && document!.vpDocumentDidAddress && (
          <div className="notarized">
            <StampSvg />
            <div className="notary-label">NOTARIZED</div>
          </div>
        )}
        <div className="img-container">
          {!base64Image && !base64Pdf && <ProgressIndicator />}
          {base64Pdf && (
            <div className="pdf-display">
              <PdfPreview fileURL={base64Pdf} height={pdfHeight} />
            </div>
          )}
          {base64Image && (
            <ImageWithStatus
              imageUrl={base64Image}
              imageViewType={ImageViewTypes.PREVIEW}
            />
          )}
          {(base64Image || base64Pdf) && (
            <div className="zoom-svg">
              <ZoomBtnSmSvg
                onClick={() => {
                  if (base64Pdf) {
                    this.openPdfWindow(base64Pdf);
                  }
                  if (base64Image) {
                    this.setState({ isZoomed: true });
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  renderImageAccess() {
    const { base64Image, base64Pdf } = { ...this.state };
    return (
      <div className="img-access">
        <Button
          color="primary"
          onClick={() => {
            if (base64Pdf) {
              this.openPdfWindow(base64Pdf);
            }
            if (base64Image) {
              this.setState({ isZoomed: true });
            }
          }}
          disabled={
            !(base64Image || base64Pdf) ||
            !this.isAllowedShareRequestPermission(
              ShareRequestPermission.CAN_VIEW
            )
          }
        >
          <ZoomSvg />
          <span>Zoom in</span>
        </Button>
        {this.isAllowedShareRequestPermission(
          ShareRequestPermission.CAN_DOWNLOAD
        ) &&
          (base64Image || base64Pdf) && (
            <Fragment>
              {base64Image && (
                <a href={base64Image} download target="_blank">
                  <Button color="primary">
                    <DownloadSvg />
                    <span>Download</span>
                  </Button>
                </a>
              )}
              {base64Pdf && (
                <a href={base64Pdf} download target="_blank">
                  <Button color="primary">
                    <DownloadSvg />
                    <span>Download</span>
                  </Button>
                </a>
              )}
            </Fragment>
          )}
        {(!this.isAllowedShareRequestPermission(
          ShareRequestPermission.CAN_DOWNLOAD
        ) ||
          (!base64Image && !base64Pdf)) && (
          <Button color="primary" disabled>
            <DownloadSvg />
            <span>Download</span>
          </Button>
        )}
        <Button
          color="primary"
          disabled={
            !this.isAllowedShareRequestPermission(
              ShareRequestPermission.CAN_DOWNLOAD
            ) ||
            (!base64Image && !base64Pdf)
          }
          onClick={() => {
            if (base64Image) {
              this.printImg(base64Image!);
            }
            if (base64Pdf) {
              this.openPdfWindow(base64Pdf);
            }
          }}
        >
          <PrintSvg />
          <span>Print</span>
        </Button>
      </div>
    );
  }

  renderImageAccessSmall() {
    const { base64Image, base64Pdf } = { ...this.state };
    return (
      <div className="img-access-sm">
        {(base64Image || base64Pdf) &&
          this.isAllowedShareRequestPermission(
            ShareRequestPermission.CAN_DOWNLOAD
          ) && (
            <button
              onClick={() => {
                // Not allowed to navigate top frame to data URL
                // window.location.href = base64Image!;
                const dataUri = base64Image ? base64Image : base64Pdf;
                const iframe =
                  '<iframe width="100%" height="100%" src="' +
                  dataUri! +
                  '"></iframe>';
                const x = window.open()!;
                x.document.open();
                x.document.write(iframe);
                x.document.close();
              }}
              className="download-btn"
            >
              Download
            </button>
          )}
        {this.isAllowedShareRequestPermission(
          ShareRequestPermission.CAN_DOWNLOAD
        ) && (
          <Fragment>
            {base64Image && (
              <button
                onClick={() => this.printImg(base64Image)}
                className="print-btn"
              >
                Print
              </button>
            )}
            {base64Pdf && (
              <button
                onClick={() => this.openPdfWindow(base64Pdf)}
                className="print-btn"
              >
                Print
              </button>
            )}
          </Fragment>
        )}
      </div>
    );
  }

  renderPreviewInfo() {
    const { document, accounts, myAccount } = { ...this.props };
    let uploadedBy = 'N/A';
    if (document) {
      const uploadedByAccount = AccountImpl.getAccountByIdAndList(
        [...accounts, myAccount],
        document!.uploadedBy
      );
      uploadedBy = AccountImpl.getFullName(
        uploadedByAccount?.firstName,
        uploadedByAccount?.lastName
      );
    }
    return (
      <Col md={12} lg={6} style={{ padding: this.previewPadding }}>
        <div className="preview-info-lg d-none d-lg-block">
          <div className="preview-info-title">Information</div>
          <div className="preview-info-item">
            <div className="attr">File</div>
            <div className="attr-value">{document!.type}</div>
          </div>
          <div className="preview-info-item">
            <div className="attr">Update date</div>
            <div className="attr-value">
              {document?.updatedAt &&
                format(new Date(document?.updatedAt), 'MM/dd/yyyy')}
              {!document?.updatedAt && '-'}
            </div>
          </div>
          <div className="preview-info-item">
            <div className="attr">Expiration Date</div>
            <div className="attr-value">
              {document?.validUntilDate &&
                format(new Date(document?.validUntilDate), 'MM/dd/yyyy')}
              {!document?.validUntilDate && '-'}
            </div>
          </div>
          <div className="preview-info-item">
            <div className="attr">Uploaded by</div>
            <div className="attr-value">{uploadedBy}</div>
          </div>
        </div>
      </Col>
    );
  }

  renderPreviewInfoSmall() {
    const { document, accounts, myAccount } = { ...this.props };
    let uploadedBy = 'N/A';
    if (document) {
      const uploadedByAccount = AccountImpl.getAccountByIdAndList(
        [...accounts, myAccount],
        document!.uploadedBy
      );
      uploadedBy = AccountImpl.getFullName(
        uploadedByAccount?.firstName,
        uploadedByAccount?.lastName
      );
    }
    return (
      <div className="preview-info d-block d-lg-none">
        <div className="preview-info-item">
          <div className="attr">File</div>
          <div className="attr-value">{document!.type}</div>
        </div>
        <div className="preview-info-item">
          <div className="attr">Update date</div>
          <div className="attr-value">
            {document?.updatedAt &&
              format(new Date(document?.updatedAt), 'MM/dd/yyyy')}
            {!document?.updatedAt && '-'}
          </div>
        </div>
        <div className="preview-info-item">
          <div className="attr">Uploaded by</div>
          <div className="attr-value">{uploadedBy}</div>
        </div>
        <div className="preview-info-item">
          <div className="attr">Valid Until</div>
          <div className="attr-value">
            {document?.validUntilDate &&
              format(new Date(document?.validUntilDate), 'MM/dd/yyyy')}
            {!document?.validUntilDate && '-'}
          </div>
        </div>
      </div>
    );
  }

  renderDeleteSmall() {
    const { document, accounts, shareRequests } = { ...this.props };
    const {
      showConfirmDeleteSection,
      hasConfirmedDelete,
      deleteConfirmInput,
    } = { ...this.state };
    return (
      <div className="delete-sm">
        <button
          onClick={() => this.setState({ showConfirmDeleteSection: true })}
        >
          <DeleteSvg2 />
          {showConfirmDeleteSection && <strong>Delete File</strong>}
          {!showConfirmDeleteSection && <span>Delete File</span>}
        </button>
        {showConfirmDeleteSection && (
          <div className="confirm-delete-sm">
            <p>
              Deleting this file will <strong>permanently</strong> erase it.
              Once deleted it cannot be recovered.
            </p>
            <p>
              <strong>Alternatively</strong>, you can choose to revoke access to
              this document with everyone in your network
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '18px',
              }}
            >
              <div className="share-with-container">
                <SharedWith
                  sharedAccounts={accounts.filter((a) =>
                    shareRequests.find(
                      (sr) =>
                        sr.shareWithAccountId === a.id &&
                        sr.documentType === document?.type
                    )
                  )}
                />
              </div>
              <Button className="unshare-btn" color="danger" outline disabled>
                Unshare
              </Button>
            </div>

            <p>Or, if you still wish to delete it...</p>
            <FormGroup>
              <Label for="documentDelete">
                Type <strong>DELETE</strong> to confirm
              </Label>
              <Input
                type="text"
                name="documentDelete"
                value={deleteConfirmInput}
                onChange={this.handleDeleteConfirmChange}
                placeholder=""
                autoComplete="off"
              />
              <span className="delete-info">
                Please enter the text exactly as displayed to confirm
              </span>
            </FormGroup>
            <div className="delete-final">
              <Button
                color="danger"
                onClick={() => this.handleDeleteDocument(document!)}
                disabled={!hasConfirmedDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  renderReplaceTab() {
    return (
      <div className="update-doc-tab-spacing">
        <FileUploader
          setFile={this.setFile}
          setUpdatedBase64Image={this.setUpdatedBase64Image}
          privateEncryptionKey={this.props.privateEncryptionKey}
          showUpdateMessage
        />
      </div>
    );
  }

  renderShareTab() {
    const { document, accounts, shareRequests } = { ...this.props };
    const {
      selectedContact,
      base64Image,
      base64Thumbnail,
      base64Pdf,
      showConfirmDeleteSection,
    } = {
      ...this.state,
    };
    return (
      <div>
        {document!.claimed && (
          <ShareDocWithContainer
            accounts={accounts}
            shareRequests={shareRequests}
            getDocumentSharedWithContact={this.getDocumentSharedWithContact}
            handleShareDocCheck={this.handleShareDocCheck}
            selectedContact={selectedContact}
            handleSelectContact={this.handleSelectContact}
            document={document}
            dataURL={base64Image ? base64Image : base64Pdf}
          />
        )}
        {document!.claimed !== undefined && document!.claimed === false && (
          <div className="claim-container">
            <div className="info">
              You must claim this document before you can share it
            </div>
            <div className="doc">
              <ImageWithStatus
                imageUrl={base64Thumbnail}
                imageViewType={ImageViewTypes.PREVIEW}
              />
              <div className="doc-info">
                <div className="info-attr">File Name</div>
                <div className="info-val">{document!.name}</div>
                <div className="info-attr">Document Name</div>
                <div className="info-val">{document!.type}</div>
                {/* TODO: expiration date */}
              </div>
            </div>
            {this.props.myAccount.role === 'owner' &&
              this.props.document?.vcJwt! &&
              this.renderNotarize()}
            <div className="buttons">
              <button className="button" onClick={this.handleClaim}>
                Claim
              </button>
              <button
                className="danger-outline button"
                onClick={() =>
                  this.setState({
                    showConfirmDeleteSection: !showConfirmDeleteSection,
                  })
                }
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  renderNotarize = () => {
    const options: OptionTypeBase[] = [];
    // this.getNotarizationInfo();
    options.push({
      value: 'certifiedCopy',
      label: 'Certified Copy',
      isDisabled: false,
    });

    // if (this.props.myAccount.role === 'owner') {
    let fundNetworkSection;

    if (this.state.networkSelect === 'rsk') {
      const rskTotalCostToSend = web3.utils.fromWei(
        '' + this.state.rskGasPrice * CONTRACT_DEFAULT_GAS,
        'ether'
      );

      const dollarAmount =
        Math.round(
          parseFloat(rskTotalCostToSend) * this.state.currentBtcPrice * 1000
        ) / 1000;

      fundNetworkSection = (
        <div>
          {' '}
          <Label
            style={{ paddingRight: '30px' }}
            for="network"
            className="other-prompt"
          >
            Please Send Funds:
          </Label>
          <p>
            {rskTotalCostToSend} RSK (${dollarAmount})
          </p>
          <QRCode value={this.state.adminPublicKey} size="256" />
          <p>{this.state.adminPublicKey}</p>
        </div>
      );
    } else if (this.state.networkSelect === 'eth') {
      const ethTotalCostToSend = web3.utils.fromWei(
        '' + this.state.ethGasPrice * CONTRACT_DEFAULT_GAS,
        'ether'
      );

      const dollarAmount =
        Math.round(
          parseFloat(ethTotalCostToSend) * this.state.currentEthPrice * 1000
        ) / 1000;

      fundNetworkSection = (
        <div>
          {' '}
          <Label
            style={{ paddingRight: '30px' }}
            for="network"
            className="other-prompt"
          >
            Please Send Funds:
          </Label>
          <p>
            {ethTotalCostToSend} ETH (${dollarAmount})
          </p>
          <QRCode value={this.state.adminPublicKey} size="256" />
          <p>{this.state.adminPublicKey}</p>
        </div>
      );
    }

    return (
      <div style={{ marginTop: '20px' }}>
        {/* <h4>Verifiable Credential</h4> */}
        {/* <pre className="vc-display">{this.props.document?.vcJwt}</pre> */}
        {/* <pre className="vc-display">{this.state.approvedVpUrl}</pre> */}

        <Label
          style={{ paddingRight: '30px' }}
          for="network"
          className="other-prompt"
        >
          Notarization Destination
        </Label>
        <select
          value={this.state.networkSelect}
          onChange={this.handleChangeNetworkSelect}
        >
          <option value="eth">Ethereum Network</option>
          <option value="rsk">RSK Network</option>
          <option value="s3">Amazon S3</option>
        </select>

        {this.state.networkSelect === 's3' ? '' : fundNetworkSection}
      </div>
    );
  };

  renderNotarizationComplete = () => {
    const { doc } = { ...this.state };
    return (
      <div>
        <h3>Verifiable Credential</h3>
        <pre className="vc-display">{this.props.document?.vcJwt}</pre>
        {doc && (
          <div className="pdf-display">
            <PdfPreview fileURL={doc.output('datauristring')} />
            <Button
              className="margin-wide"
              color="primary"
              onClick={() => doc.save()}
            >
              Save Pdf
            </Button>
          </div>
        )}
      </div>
    );
  };

  renderConfirmDelete() {
    const { document, accounts, shareRequests } = { ...this.props };
    const { hasConfirmedDelete, deleteConfirmInput, base64Thumbnail } = {
      ...this.state,
    };
    return (
      <div className="confirm-delete-container">
        <div className="delete-prompt">
          Are you sure you want to permanently delete this file?
        </div>
        <div className="delete-section">
          {/* <div className="delete-image-container">
            {document && (
              <img
                className="delete-image"
                src={base64Thumbnail}
                alt="doc missing"
              />
            )}
          </div> */}
          <div className="delete-info">
            <div className="delete-info-prompt">
              <p>
                Deleting this file will <strong>permanently</strong> erase it
                from MyPass. Once deleted it cannot be recovered.
              </p>
              <p>
                <strong>Alternatively</strong>, you can choose to revoke access
                to this document with everyone in your network
              </p>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: '8px',
                  marginBottom: '24px',
                }}
              >
                <div className="share-with-container">
                  <SharedWith
                    sharedAccounts={accounts.filter((a) =>
                      shareRequests.find(
                        (sr) =>
                          sr.shareWithAccountId === a.id &&
                          sr.documentType === document?.type
                      )
                    )}
                  />
                </div>
                <Button className="unshare-btn" color="danger" outline disabled>
                  Unshare
                </Button>
              </div>
              <p>Or, if you still wish to delete it...</p>
            </div>
            <FormGroup className="confirm-delete-form">
              <Label for="documentDelete" className="other-prompt">
                Type <strong>DELETE</strong> to confirm
              </Label>
              <Input
                type="text"
                name="documentDelete"
                value={deleteConfirmInput}
                onChange={this.handleDeleteConfirmChange}
                placeholder=""
                autoComplete="off"
              />
              <span>Please enter the text exactly as displayed to confirm</span>
            </FormGroup>
          </div>
        </div>
        <div className="delete-buttons">
          <Button
            className="margin-wide"
            color="danger"
            onClick={() => this.handleDeleteDocument(document!)}
            disabled={!hasConfirmedDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    );
  }

  renderConfirmShareModal() {
    const { document } = { ...this.props };
    const { selectedContact, showConfirmShare, base64Image } = {
      ...this.state,
    };
    return (
      <Modal
        toggle={this.toggleConfirmShare}
        size={'lg'}
        isOpen={showConfirmShare}
      >
        <ModalBody>
          {document && (
            <div className="confirm-share">
              <div className="confirm-share-prompt">
                You're about to share
                <br />
                {document?.type?.toUpperCase()} with{' '}
                {AccountImpl.getFullName(
                  selectedContact?.firstName,
                  selectedContact?.lastName
                ).toUpperCase()}
                .
              </div>
              <img
                className="share-doc-img"
                src={base64Image}
                alt="doc missing"
              />
              <div className="confirm-prompt">
                Are you sure you want to continue?
              </div>
              <div className="confirm-buttons">
                <Button
                  outline
                  color="secondary"
                  onClick={this.toggleConfirmShare}
                >
                  No, take me back
                </Button>
                <Button
                  color="primary"
                  onClick={this.handleShareDocWithContact}
                >
                  Yes, share access
                </Button>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>
    );
  }

  renderUpdateDocument() {
    const {
      activeTab,
      showConfirmDeleteSection,
      isZoomed,
      base64Image,
      base64Thumbnail,
    } = { ...this.state };
    return (
      <Fragment>
        {this.renderNav()}
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">{this.renderPreviewTab()}</TabPane>
          <TabPane tabId="2">{this.renderReplaceTab()}</TabPane>
          <TabPane tabId="3">{this.renderShareTab()}</TabPane>
          <TabPane tabId="4">
            {this.state.vc === undefined
              ? this.renderNotarize()
              : this.renderNotarizationComplete()}
          </TabPane>
        </TabContent>
        {isZoomed && (
          <Lightbox
            // reactModalStyle={{zIndex: '1060'}}
            mainSrc={base64Image!}
            onCloseRequest={() => this.setState({ isZoomed: false })}
          />
        )}
        {this.renderConfirmShareModal()}
      </Fragment>
    );
  }

  render() {
    const { showModal, document } = { ...this.props };
    const { activeTab, newFile, isLoading } = { ...this.state };
    const closeBtn = (
      <div className="modal-close" onClick={this.toggleModal}>
        <CrossSvg className="lg" />
        <CrossSmSvg className="sm" />
      </div>
    );
    return (
      <Fragment>
        {isLoading && <ProgressIndicator isFullscreen />}
        <Modal
          isOpen={showModal}
          toggle={this.toggleModal}
          backdrop={'static'}
          size={'xl'}
          className="update-doc-modal"
        >
          <ModalHeader toggle={this.toggleModal} close={closeBtn}>
            {this.renderModalHeader()}
          </ModalHeader>
          <ModalBody className="update-doc-container">
            {document && document.url.length <= 0 && this.renderNotShared()}
            {document && document.url.length > 0 && this.renderUpdateDocument()}
          </ModalBody>
          {activeTab === '2' && (
            <ModalFooter className="modal-footer-center">
              <Button
                color="primary"
                onClick={this.handleUpdateDocument}
                disabled={!newFile}
              >
                Save
              </Button>
            </ModalFooter>
          )}
        </Modal>
      </Fragment>
    );
  }
}
export default UpdateDocumentModal;
