import { Fragment, useEffect, useState } from "react";
import {
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "reactstrap";
import "./MainContainer.scss";
import AccountPage from "./account/AccountPage";
import BringYourKeyPage from "./account/BringYourKeyPage";
import CheckoutPage from "./account/CheckoutPage";
import AdminPage from "./account/AdminPage";
import SearchInput from "../common/SearchInput";
import Account from "../../models/Account";
import Document from "../../models/document/Document";
import StringUtil from "../../util/StringUtil";
import DocumentService from "../../services/DocumentService";
import ProgressIndicator from "../common/ProgressIndicator";
import Folder from "../common/Folder";
import DocumentType from "../../models/DocumentType";
import DocumentTypeService from "../../services/DocumentTypeService";
import AddDocumentModal from "./document/AddDocumentModal";
import UpdateDocumentModal from "./document/UpdateDocumentModal";
import AccountService from "../../services/AccountService";
import HelperContactService from "../../services/HelperContactService";
import DocumentPage from "./DocumentPage";
import ClientPage from "./account/ClientPage";
import ShareRequest from "../../models/ShareRequest";
import UpdateDocumentRequest from "../../models/document/UpdateDocumentRequest";
import AccountImpl from "../../models/AccountImpl";
import { ReactComponent as LogoSm } from "../../img/logo-sm.svg";
import Sidebar from "../layout/Sidebar";
import ShareRequestService from "../../services/ShareRequestService";
import {
  HashRouter as Router,
  Route,
  Link,
  Routes,
  Navigate,
  useParams,
} from "react-router-dom";
import ZipUtil from "../../util/ZipUtil";
import CryptoUtil from "../../util/CryptoUtil";
import AppSetting, { SettingNameEnum } from "../../models/AppSetting";
import HelperContact from "../../models/HelperContact";
import Role from "../../models/Role";
import ProfileImage from "../common/ProfileImage";
import MySettings from "./MySettings";
import NotaryPdfTestPage from "../NotaryPdfTestPage";
// import documentSelected from "../../test-data/document";
import FileUtil from "../../util/FileUtil";

interface MainContainerProps {
  appSettings: AppSetting[];
  saveAppSettings: (title: string, logo?: File) => Promise<void>;
  account: Account;
  handleLogout: () => void;
  updateAccountShareRequests: (requests: ShareRequest[]) => void;
  privateEncryptionKey?: string;
  setBringYourOwnEncryptionKey: (key) => void;
  coreFeatures: string[];
  viewFeatures: string[];
  setMyAccount: (account: Account) => void;
  handleSaveAdminAccount: (email: string, password: string) => Promise<void>;
}

const MainContainer = (props: MainContainerProps) => {
  const { id: paramId } = useParams();
  const {
    appSettings,
    saveAppSettings,
    account,
    handleLogout,
    updateAccountShareRequests,
    privateEncryptionKey,
    setBringYourOwnEncryptionKey,
    coreFeatures,
    viewFeatures,
    setMyAccount,
    handleSaveAdminAccount,
  } = props;
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchedDocuments, setSearchedDocuments] = useState<Document[]>([]);
  const [documentSelected, setDocumentsSelected] = useState<
    Document | undefined
  >(undefined);
  const [isAccount, setIsAccount] = useState<boolean>(false);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState<boolean>(false);
  const [isSmallMenuOpen, setIsSmallMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [documentQuery, setDocumentQuery] = useState<string>("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [helperAccounts, setHelperAccounts] = useState<Account[]>([]);
  const [helperContacts, setHelperContacts] = useState<HelperContact[]>([]);
  const [searchedHelperContacts, setSearchedHelperContacts] = useState<
    HelperContact[]
  >([]);
  const [activeTab, setActiveTab] = useState<string>("1");
  const [activeDocumentTab, setActiveDocumentTab] = useState<string>("1");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [clientShares, setClientShares] = useState<Map<string, ShareRequest[]>>(
    new Map()
  );
  const [isMySettingsOpen, setIsMySettingsOpen] = useState<boolean>(false);
  const [clientIdSelected, setClientIdSelected] = useState<string>();

  useEffect(() => {
    (async () => {
      let newDocumentTypes = documentTypes;
      let newAccounts = accounts;
      let newHelperAccounts = helperAccounts;
      let newClientShares = clientShares;
      let newHelperContacts = helperContacts;
      try {
        newDocumentTypes = (await DocumentTypeService.get()).documentTypes;
        if (account.role === Role.helper) {
          newAccounts = (await AccountService.getAccounts()).filter(
            (accountItem) => {
              if (
                accountItem.role === Role.owner &&
                accountItem.id !== account.id
              ) {
                return accountItem;
              } else {
                return false;
              }
            }
          ) as any;
          newHelperAccounts = (await AccountService.getAccounts()).filter(
            (accountItem) => {
              if (accountItem.role === Role.helper) {
                return accountItem;
              } else {
                return false;
              }
            }
          ) as any;
          for (const otherOwnerAccount of newAccounts as any) {
            const shareRequests = await ShareRequestService.get(
              otherOwnerAccount.id
            );
            newClientShares.set(otherOwnerAccount.id, shareRequests);
          }
        } else {
          newAccounts = (await AccountService.getAccounts()).filter(
            (accountItem) => {
              if (
                accountItem.role === Role.helper &&
                accountItem.id !== account.id
              ) {
                return accountItem;
              } else {
                return false;
              }
            }
          ) as any;
        }

        newHelperContacts = await HelperContactService.getHelperContacts();
        // NOTE: since not paging yet, preventing from getting too big for layout
        // accounts = accounts.length > 8 ? accounts.slice(0, 8) : accounts;
      } catch (err) {
        console.error("failed to fetch main data");
      }
      setDocuments(account.documents);
      setDocumentTypes(newDocumentTypes);
      setSearchedDocuments(sortDocuments(account.documents, sortAsc));
      setIsLoading(false);
      setAccounts(newAccounts);
      setHelperAccounts(newHelperAccounts);
      setHelperContacts(newHelperContacts);
      setSearchedHelperContacts(
        sortHelperContacts(newHelperContacts, sortAsc, account.role)
      );
      setClientShares(newClientShares);
    })();
  }, []);

  const addHelperContact = async (helperContactReq) => {
    const newHelperContact = await HelperContactService.addHelperContact(
      helperContactReq
    );
    setHelperContacts([newHelperContact, ...helperContacts]);
    setSearchedHelperContacts([newHelperContact, ...helperContacts]);
  };

  const unshareAllWithHelperContact = async (helperAccount: Account) => {
    let { shareRequests } = account;
    shareRequests = shareRequests.filter(
      (shareRequest) => shareRequest.shareWithAccountId !== helperAccount.id
    );
    const helperContactMatch = helperContacts.find(
      (hc) => hc.helperAccount.username === helperAccount.username
    );
    await HelperContactService.unshareAllWithHelper(helperContactMatch!._id);
    updateAccountShareRequests(shareRequests);
  };

  const removeHelperContact = async (account: Account) => {
    const helperContactMatch = helperContacts.find(
      (hc) => hc.helperAccount.username === account.username
    );
    const newHelperContacts = helperContacts.filter(
      (hc) => hc.helperAccount.username !== account.username
    );
    await HelperContactService.deleteHelperContact(helperContactMatch!._id);
    setHelperContacts(newHelperContacts);
    setSearchedHelperContacts(
      sortHelperContacts(newHelperContacts, sortAsc, account.role)
    );
  };

  const updateHelperContactPermissions = async (hc: HelperContact) => {
    const newHelperContacts = helperContacts.map((hcItem) => {
      if (hcItem._id === hc._id) {
        hcItem.canAddNewDocuments = hc.canAddNewDocuments;
        hcItem.isSocialAttestationEnabled = hc.isSocialAttestationEnabled;
      }
      return hcItem;
    });
    await HelperContactService.updateHelperContact(hc);
    setHelperContacts(newHelperContacts);
    setSearchedHelperContacts(
      sortHelperContacts(newHelperContacts, sortAsc, Role.helper)
    );
  };

  const handleSearch = (query: string) => {
    let newSearchedDocuments = documents.filter((document) => {
      return (
        document.type &&
        document.type.toLowerCase().indexOf(query.toLowerCase()) !== -1
      );
    });
    let newSearchedHelperContacts = helperContacts.filter((helperContact) => {
      const a =
        account.role === Role.owner
          ? helperContact.helperAccount
          : helperContact.ownerAccount;
      return (
        (AccountImpl.getFullName(a?.firstName, a?.lastName) &&
          AccountImpl.getFullName(a?.firstName, a?.lastName)
            .toLowerCase()
            .indexOf(query.toLowerCase()) !== -1) ||
        (a.email &&
          a.email.toLowerCase().indexOf(query.toLowerCase()) !== -1) ||
        (a.username &&
          a.username.toLowerCase().indexOf(query.toLowerCase()) !== -1)
      );
    });
    if (query.length === 0) {
      newSearchedDocuments = documents;
      newSearchedHelperContacts = helperContacts;
    }
    newSearchedDocuments = sortDocuments(searchedDocuments, sortAsc);
    newSearchedHelperContacts = sortHelperContacts(
      searchedHelperContacts,
      sortAsc,
      account.role
    );
    setSearchedDocuments(newSearchedDocuments);
    setSearchedHelperContacts(newSearchedHelperContacts);
    setDocumentQuery(query);
  };

  useEffect(() => {
    handleSearch(documentQuery);
  }, [documents, documentQuery, handleSearch]);

  const toggleSort = () => {
    const newSortAsc = !sortAsc;
    const newSearchedDocuments = sortDocuments(searchedDocuments, newSortAsc);
    const newSearchedHelperContacts = sortHelperContacts(
      searchedHelperContacts,
      newSortAsc,
      account.role
    );
    setSortAsc(newSortAsc);
    setSearchedDocuments(newSearchedDocuments);
    setSearchedHelperContacts(newSearchedHelperContacts);
  };

  const sortDocuments = (documents: Document[], sortAsc: boolean) => {
    return documents.sort((docA: Document, docB: Document) => {
      if (docA.type < docB.type) {
        return sortAsc ? -1 : 1;
      }
      if (docA.type > docB.type) {
        return sortAsc ? 1 : -1;
      }
      return 0;
    });
  };

  const sortHelperContacts = (
    accounts1: HelperContact[],
    sortAsc1: boolean,
    role
  ) => {
    return accounts1.sort((a1: HelperContact, b1: HelperContact) => {
      const a = role === Role.owner ? a1.helperAccount : a1.ownerAccount;
      const b = role === Role.owner ? b1.helperAccount : b1.ownerAccount;
      if (a.firstName! < b.firstName!) {
        return sortAsc1 ? -1 : 1;
      }
      if (a.firstName! > b.firstName!) {
        return sortAsc1 ? 1 : -1;
      }
      return 0;
    });
  };

  const handleSelectDocument = (document?: Document, goToClaim?: boolean) => {
    setDocumentsSelected(document);
    setActiveDocumentTab(goToClaim ? "3" : "1");
  };

  const goToAccount = () => {
    setDocumentsSelected(undefined);
    setIsAccount(true);
    setActiveDocumentTab("1");
  };

  const goBack = () => {
    setDocumentsSelected(undefined);
    setIsAccount(false);
    setActiveDocumentTab("1");
  };

  const handleAddNew = () => {
    toggleModal();
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const toggleAccountMenu = () => {
    setIsAccountMenuOpen(!isAccountMenuOpen);
  };

  const toggleSmallMenu = () => {
    setIsSmallMenuOpen(!isSmallMenuOpen);
  };

  const handleAddNewDocument = async (
    newFile: File,
    newThumbnailFile: File,
    documentTypeSelected: string,
    referencedAccount?: Account,
    validUntilDate?: Date
  ): Promise<Document> => {
    const newDocuments = [...documents];
    setIsLoading(true);
    let newDocument;
    try {
      if (newFile) {
        try {
          if (referencedAccount) {
            const caseWorkerFile = newFile;
            const caseWorkerThumbnail = newThumbnailFile;
            const originalBase64 = await CryptoUtil.getDecryptedString(
              privateEncryptionKey!,
              await ZipUtil.unzip(
                await StringUtil.fileContentsToString(newFile)
              )
            );
            const thumbnailBase64 = await CryptoUtil.getDecryptedString(
              privateEncryptionKey!,
              await ZipUtil.unzip(
                await StringUtil.fileContentsToString(newThumbnailFile)
              )
            );
            const ownerEncrypted = await CryptoUtil.getEncryptedByPublicString(
              referencedAccount.didPublicEncryptionKey!,
              originalBase64
            );
            const ownerEncryptedThumbnail =
              await CryptoUtil.getEncryptedByPublicString(
                referencedAccount.didPublicEncryptionKey!,
                thumbnailBase64
              );
            const ownerZipped: Blob = await ZipUtil.zip(ownerEncrypted);
            const ownerZippedThumbnail: Blob = await ZipUtil.zip(
              ownerEncryptedThumbnail
            );
            const ownerFile = new File([ownerZipped], "encrypted-image.zip", {
              type: "application/zip",
              lastModified: Date.now(),
            });
            const ownerThumbnail = new File(
              [ownerZippedThumbnail],
              "encrypted-image-thumbnail.zip",
              { type: "application/zip", lastModified: Date.now() }
            );
            const response = await DocumentService.uploadDocumentOnBehalfOfUser(
              caseWorkerFile,
              caseWorkerThumbnail,
              ownerFile,
              ownerThumbnail,
              documentTypeSelected!,
              referencedAccount.id,
              validUntilDate
            );
            handleClientSelected(referencedAccount);
            newDocument = response.document;
            // newDocument._id = newDocument.id;
          } else {
            const response = await DocumentService.addDocument(
              newFile,
              newThumbnailFile,
              documentTypeSelected!,
              account.didPublicEncryptionKey!,
              validUntilDate
            );
            newDocument = response.document;
            // NOTE: The uploaded by account object is nice but switching to account id to make consistent with the /my-account api call
            newDocument.uploadedBy = newDocument.uploadedBy.id;
            newDocument._id = newDocument.id;
          }
        } catch (err) {
          console.error(err.message);
        }
      }
    } catch (err) {
      console.error("failed to upload file");
    }
    setDocuments((docs) => [newDocument, ...docs]);
    setSearchedDocuments((docs) => [newDocument, ...docs]);
    setIsLoading(false);
    return newDocument as any;
  };

  const handleUpdateDocument = async (request: UpdateDocumentRequest) => {
    setIsLoading(true);
    let newDocuments = [...documents];
    try {
      const updatedDoc = await DocumentService.updateDocument(request);
      // FIXME: get API call to return updatedAt
      updatedDoc.updatedAt = new Date();
      newDocuments = documents.map((doc) =>
        doc.type === updatedDoc.type ? updatedDoc : doc
      );
    } catch (err) {
      console.error("failed to upload file");
    }
    setDocuments(newDocuments);
    setShowModal(false);
    setIsLoading(false);
    setDocumentsSelected(undefined);
    setActiveDocumentTab("1");
  };

  const handleUpdateDocumentAndUpdateShareRequests = async (
    request: UpdateDocumentRequest
  ) => {
    setIsLoading(true);
    let updatedDoc;
    let newDocuments = [...documents];
    try {
      // also !request.id
      if (request.referencedAccount) {
        // then helper is updating
        const response = await DocumentService.getByShareRequest(
          request.shareRequestId
        );
        request.id = response.document._id;
        const { newZippedFile, newZippedThumbnailFile } =
          await FileUtil.dataURLToEncryptedFiles(
            request.base64Image!,
            request.referencedAccount.didPublicEncryptionKey!
          );
        request.img = newZippedFile;
        request.thumbnail = newZippedThumbnailFile;
      }
      updatedDoc = await DocumentService.updateDocument(request);
      if (!request.referencedAccount) {
        updatedDoc.updatedAt = new Date();
        newDocuments = newDocuments.map((doc) =>
          doc.type === updatedDoc.type ? updatedDoc : doc
        );
      }
    } catch (err) {
      console.error("failed to upload file");
    }

    let matchedShareRequests = account.shareRequests.filter((shareRequest) => {
      return shareRequest.documentType === updatedDoc.type;
    });
    if (request.referencedAccount) {
      matchedShareRequests = request.referencedAccount.shareRequests.filter(
        (shareRequest) => {
          return shareRequest.documentType === updatedDoc.type;
        }
      );
    }

    // remove existing share requests
    try {
      for (const matchedShareRequest of matchedShareRequests) {
        if (!request.referencedAccount) {
          await ShareRequestService.deleteShareRequest(
            matchedShareRequest!._id!
          );
          // remove share requests from UI
          removeShareRequest(matchedShareRequest);
        } else {
          removeShareRequest(
            matchedShareRequest,
            request.referencedAccount!.id
          );
        }
      }
    } catch (err) {
      console.error(err.message);
    }

    // create new share requests
    try {
      for (const matchedShareRequest of matchedShareRequests) {
        let selectedContact = accounts.find(
          (account1) => account1.id === matchedShareRequest.shareWithAccountId!
        );
        if (request.referencedAccount) {
          selectedContact = helperAccounts!.find(
            (account1) =>
              account1.id === matchedShareRequest.shareWithAccountId!
          );
        }

        const { newZippedFile, newZippedThumbnailFile } =
          await FileUtil.dataURLToEncryptedFiles(
            request.base64Image!,
            selectedContact!.didPublicEncryptionKey!
          );
        let newShareRequest;
        if (!request.referencedAccount) {
          newShareRequest = await ShareRequestService.addShareRequestFile(
            newZippedFile,
            newZippedThumbnailFile,
            updatedDoc?.type!,
            account.id,
            matchedShareRequest.shareWithAccountId!,
            {
              canView: matchedShareRequest.canView,
              canReplace: matchedShareRequest.canReplace,
              canDownload: matchedShareRequest.canDownload,
            }
          );
          // add share request to UI
          addShareRequest(newShareRequest);
        } else {
          newShareRequest = await ShareRequestService.replaceShareRequestFile(
            newZippedFile,
            newZippedThumbnailFile,
            updatedDoc?.type!,
            request.referencedAccount.id,
            matchedShareRequest.shareWithAccountId!,
            {
              canView: matchedShareRequest.canView,
              canReplace: matchedShareRequest.canReplace,
              canDownload: matchedShareRequest.canDownload,
            },
            matchedShareRequest._id!
          );
          if (account.id === newShareRequest.shareWithAccountId) {
            newDocuments = newDocuments.map((doc) =>
              doc.type === newShareRequest.documentType
                ? {
                    type: newShareRequest.documentType,
                    url: newShareRequest.approved
                      ? newShareRequest.documentUrl
                      : "",
                    thumbnailUrl: newShareRequest.documentThumbnailUrl
                      ? newShareRequest.documentThumbnailUrl
                      : "",
                    sharedWithAccountIds: [newShareRequest.shareWithAccountId],
                    validUntilDate: newShareRequest.validUntilDate,
                    vcJwt: newShareRequest.vcJwt,
                    vpDocumentDidAddress: newShareRequest.vpDocumentDidAddress,
                    shareRequestId: newShareRequest._id,
                  }
                : doc
            );
          }
          addShareRequest(newShareRequest, request.referencedAccount.id);
        }
      }
    } catch (err) {
      console.error(err.message);
    }
    setDocuments(newDocuments);
    setShowModal(false);
    setIsLoading(false);
    setDocumentsSelected(undefined);
    setActiveDocumentTab("1");
  };

  const handleDeleteDocument = async (document: Document) => {
    setIsLoading(true);
    let newSearchedDocuments = [...searchedDocuments];
    let newDocuments = [...documents];
    try {
      await DocumentService.deleteDocument(document.url);
    } catch (err) {
      console.error("failed to remove image");
    }

    newSearchedDocuments = newSearchedDocuments.filter((searchedDocument) => {
      return (searchedDocument as Document).url !== document.url;
    });
    newDocuments = newDocuments.filter((documentItem) => {
      return (documentItem as Document).url !== document.url;
    });
    // also remove share requests
    const matchedShareRequests = account.shareRequests.filter(
      (shareRequest) => {
        return shareRequest.documentType === document.type;
      }
    );
    matchedShareRequests.forEach((matchedShareRequest) =>
      removeShareRequest(matchedShareRequest)
    );
    setDocuments(newDocuments);
    setSearchedDocuments(newSearchedDocuments);
    setIsLoading(false);
    setDocumentsSelected(undefined);
    setActiveDocumentTab("1");
  };

  const addShareRequest = (
    request: ShareRequest,
    fromAccountId: string | undefined = undefined
  ) => {
    const { shareRequests } = account;
    if (account.role === Role.helper) {
      const clientShare = clientShares.get(fromAccountId!);
      clientShare!.push(request);
      clientShares.set(fromAccountId!, clientShare!);
    } else {
      shareRequests.push(request);
      updateAccountShareRequests(shareRequests);
    }
    setClientShares(clientShares);
  };

  const removeShareRequest = (
    request: ShareRequest,
    fromAccountId: string | undefined = undefined
  ) => {
    let { shareRequests } = account;
    if (account.role === Role.helper) {
      const clientShare = clientShares.get(fromAccountId!);
      clientShares.set(
        fromAccountId!,
        clientShare!.filter((sr) => sr._id !== request._id)
      );
    } else {
      shareRequests = shareRequests.filter(
        (shareRequest) => shareRequest._id !== request._id
      );
      updateAccountShareRequests(shareRequests);
    }
    setClientShares(clientShares);
  };

  const handleClientSelected = async (otherOwnerAccount: Account) => {
    setIsLoading(true);
    let newDocuments = [...documents];
    try {
      const shareRequests = await ShareRequestService.get(otherOwnerAccount.id);
      const sharedDocuments: Document[] = shareRequests
        .filter((shareRequest: ShareRequest) => {
          return shareRequest.shareWithAccountId === account.id;
        })
        .map((shareRequest: any) => {
          return {
            type: shareRequest.documentType,
            url: shareRequest.approved ? shareRequest.documentUrl : "",
            thumbnailUrl: shareRequest.documentThumbnailUrl
              ? shareRequest.documentThumbnailUrl
              : "",
            sharedWithAccountIds: [shareRequest.shareWithAccountId],
            validUntilDate: shareRequest.validUntilDate,
            vcJwt: shareRequest.vcJwt,
            vpDocumentDidAddress: shareRequest.vpDocumentDidAddress,
            shareRequestId: shareRequest._id,
          };
        });
      const docTypes: string[] =
        await DocumentTypeService.getDocumentTypesAccountHas(
          otherOwnerAccount.id
        );
      const notSharedDocuments: Document[] = docTypes
        .filter((docType) => {
          return !sharedDocuments.some(
            (sharedDocument) => sharedDocument.type === docType
          );
        })
        .map((docType) => {
          return {
            type: docType,
            url: "",
            thumbnailUrl: "",
            sharedWithAccountIds: [],
            // validUntilDate: shareRequest.validUntilDate
          };
        });
      newDocuments = [
        ...account.documents,
        ...sharedDocuments,
        ...notSharedDocuments,
      ];
    } catch (err) {
      console.error(err.message);
    }
    setDocuments(newDocuments);
    setIsLoading(false);
    setClientIdSelected(otherOwnerAccount.id);
  };

  const renderAddDocumentModal = () => {
    let referencedAccount;
    if (paramId) {
      referencedAccount = accounts.find(
        (accountItem) => accountItem.id === paramId
      );
    }
    return (
      <AddDocumentModal
        myAccount={account}
        showModal={showModal}
        toggleModal={toggleModal}
        documentTypes={documentTypes}
        documents={documents}
        handleAddNewDocument={handleAddNewDocument}
        privateEncryptionKey={privateEncryptionKey}
        referencedAccount={referencedAccount}
        // used to put in the pdf over the original image.
        handleUpdateDocument={handleUpdateDocument}
      />
    );
  };

  const renderUpdateDocumentModal = () => {
    let referencedAccount: Account | undefined;
    if (paramId) {
      referencedAccount = accounts.find(
        (accountItem) => accountItem.id === paramId
      )!;
      if (referencedAccount) {
        referencedAccount.shareRequests = clientShares.get(
          referencedAccount.id
        )!;
      }
    }
    let shareRequests: ShareRequest[] = account.shareRequests.filter(
      (sharedRequest) => {
        if (sharedRequest.documentType === documentSelected?.type) {
          return sharedRequest;
        } else {
          return false;
        }
      }
    );
    if (account.role === Role.helper) {
      try {
        shareRequests = clientShares
          .get(clientIdSelected!)!
          .filter((sr) => sr.shareWithAccountId === account.id);
      } catch (err) {
        return <Fragment />;
      }
    }
    const contactAccounts = accounts.filter((a) =>
      helperContacts.find((hc) => a.username === hc.helperAccount.username)
    );
    return (
      <UpdateDocumentModal
        accounts={contactAccounts}
        showModal={!!documentSelected}
        toggleModal={() => {
          setDocumentsSelected(undefined);
          setActiveDocumentTab("1");
        }}
        documentTypes={documentTypes}
        document={documentSelected}
        shareRequests={shareRequests}
        handleUpdateDocument={handleUpdateDocument}
        handleUpdateDocumentAndUpdateShareRequests={
          handleUpdateDocumentAndUpdateShareRequests
        }
        handleDeleteDocument={handleDeleteDocument}
        addShareRequest={addShareRequest}
        removeShareRequest={removeShareRequest}
        myAccount={account}
        privateEncryptionKey={props.privateEncryptionKey}
        referencedAccount={referencedAccount}
        handleClientSelected={handleClientSelected}
        activeTab={activeDocumentTab}
      />
    );
  };

  const renderTopBarSmall = () => {
    return (
      <div id="main-top-bar-sm">
        <LogoSm onClick={() => setSidebarOpen(true)} />
        {account.role !== "admin" && (
          <SearchInput handleSearch={handleSearch} autoSearch />
        )}
      </div>
    );
  };

  const renderTopBar = (adminLogin) => {
    const logoSetting = appSettings.find(
      (a) => a.settingName === SettingNameEnum.LOGO
    );
    return (
      <div>
        <div id="main-top-bar">
          <div id="main-logo" onClick={() => setActiveTab("1")}>
            <Link to={account.role === "helper" ? "/clients" : "/documents"}>
              {logoSetting && (
                <img
                  style={{ height: "130px" }}
                  // className="shared-with-image-single"
                  src={AccountService.getImageURL(logoSetting.settingValue)}
                  alt="Profile"
                />
              )}
              {!logoSetting && <Folder />}
            </Link>
          </div>
          {account.role !== "admin" && adminLogin !== true && (
            <Row id="main-search">
              <Col style={{ display: "flex" }}>
                <SearchInput handleSearch={handleSearch} autoSearch />
              </Col>
            </Row>
          )}
          <div id="main-profile">
            <Dropdown isOpen={isAccountMenuOpen} toggle={toggleAccountMenu}>
              <DropdownToggle
                tag="div"
                data-toggle="dropdown"
                aria-expanded={isAccountMenuOpen}
              >
                <ProfileImage account={account} />
              </DropdownToggle>
              <DropdownMenu end>
                <DropdownItem>
                  {account.role === Role.helper && (
                    <Link to="/helper-login/account">My Account</Link>
                  )}
                  {account.role === Role.owner && (
                    <Link to="/account">My Account</Link>
                  )}
                </DropdownItem>
                <DropdownItem>
                  <div
                    onClick={() => {
                      setIsMySettingsOpen(true);
                    }}
                  >
                    My Settings
                  </div>
                </DropdownItem>
                <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    );
  };

  const renderAccount = () => {
    // if (isAccount) {
    return <AccountPage goBack={goBack} account={account} />;
    // }
    // return <Fragment />;
  };

  const renderBringYourKeyPage = () => {
    return (
      <BringYourKeyPage
        goBack={goBack}
        account={account}
        setBringYourOwnEncryptionKey={props.setBringYourOwnEncryptionKey}
      />
    );
  };

  const renderCheckoutPage = () => {
    return (
      <CheckoutPage
        privateEncryptionKey={privateEncryptionKey}
        goBack={goBack}
        account={account}
      />
    );
  };

  const renderAdminPage = () => {
    return (
      <AdminPage
        handleSaveAdminAccount={handleSaveAdminAccount}
        goBack={goBack}
        account={account}
        appSettings={appSettings}
        saveAppSettings={saveAppSettings}
      />
    );
  };

  const renderMyClients = () => {
    const contactAccounts = searchedHelperContacts.map((hc) => {
      const item = hc.ownerAccount;
      item.id = accounts.find((a) => a.email === item.email)!.id;
      item._id = accounts.find((a) => a.email === item.email)!._id;
      return item;
    });
    return (
      <ClientPage
        otherOwnerAccounts={contactAccounts}
        handleAddNew={handleAddNew}
        handleSelectDocument={handleSelectDocument}
        searchedDocuments={searchedDocuments}
        sortAsc={sortAsc}
        toggleSort={toggleSort}
        myAccount={account}
        addShareRequest={addShareRequest}
        removeShareRequest={removeShareRequest}
        privateEncryptionKey={privateEncryptionKey!}
        clientShares={clientShares}
        handleClientSelected={handleClientSelected}
        isLoading={isLoading}
      />
    );
  };

  const renderDocumentPage = () => {
    let referencedAccount;
    let sharedRequests = account.shareRequests;
    if (paramId) {
      referencedAccount = accounts.filter(
        (accountItem) => accountItem.id === paramId
      )[0];
      const selectedClientShares = clientShares.get(clientIdSelected!);
      sharedRequests = selectedClientShares
        ? selectedClientShares.filter(
            (sr) => sr.shareWithAccountId === account.id
          )
        : [];
    }
    return (
      <DocumentPage
        updateHelperContactPermissions={updateHelperContactPermissions}
        unshareAllWithHelperContact={unshareAllWithHelperContact}
        removeHelperContact={removeHelperContact}
        sortAsc={sortAsc}
        toggleSort={toggleSort}
        handleAddNew={handleAddNew}
        searchedDocuments={searchedDocuments}
        handleSelectDocument={handleSelectDocument}
        addHelperContact={addHelperContact}
        helperContacts={helperContacts}
        searchedHelperContacts={searchedHelperContacts}
        accounts={accounts}
        shareRequests={sharedRequests}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        myAccount={account}
        addShareRequest={addShareRequest}
        removeShareRequest={removeShareRequest}
        privateEncryptionKey={privateEncryptionKey}
        referencedAccount={referencedAccount}
        handleClientSelected={handleClientSelected}
        coreFeatures={coreFeatures}
        viewFeatures={viewFeatures}
      />
    );
  };

  let adminLogin = false;

  if (
    (window.location.href.indexOf("admin-login") > -1 &&
      account.canAddOtherAccounts) ||
    account.role === Role.admin
  ) {
    adminLogin = true;
  }

  if (adminLogin) {
    return (
      <Router>
        <div id="main-container">
          {renderTopBar(false)}
          <div className="main-section">{renderAdminPage()}</div>
        </div>
      </Router>
    );
  }

  return (
    <Router
    // history={history}
    >
      {isLoading && <ProgressIndicator isFullscreen />}
      <div id="main-container">
        {privateEncryptionKey && (
          <MySettings
            isOpen={isMySettingsOpen}
            setOpen={(isOpen) => setIsMySettingsOpen(isOpen)}
            privateEncryptionKey={privateEncryptionKey}
            account={account}
            setMyAccount={setMyAccount}
            helperContacts={helperContacts}
          />
        )}
        <Sidebar
          appSettings={appSettings}
          account={account}
          handleLogout={handleLogout}
          goToAccount={goToAccount}
          isOpen={!!sidebarOpen}
          setOpen={setSidebarOpen}
          goToMySettings={() => setIsMySettingsOpen(true)}
        />
        {renderTopBar(false)}
        {renderTopBarSmall()}
        <div className="main-page">
          {account.role !== Role.admin && <div className="main-side" />}
          <div className="main-section">
            {isAccount && <Navigate replace to="**/account" />}
            <Routes>
              <Route
                path="/secure-login"
                element={<Navigate replace to="/" />}
              />
              <Route
                path="/helper-login"
                element={<Navigate replace to="/helper-login/clients" />}
              />
              <Route
                path="/"
                element={
                  <>
                    {account.role === Role.helper && (
                      <Navigate replace to="/helper-login/clients" />
                    )}
                    {account.role === Role.owner && (
                      <Navigate replace to="/documents" />
                    )}
                    {account.role === Role.admin && (
                      <Navigate replace to="/admin-login" />
                    )}
                  </>
                }
              />
              <Route path="/account" element={renderAccount()} />
              <Route
                path="/documents"
                element={
                  <Fragment>
                    {account.role === Role.helper && (
                      <Navigate replace to="/helper-login/clients" />
                    )}
                    {account.role === Role.admin && (
                      <Navigate replace to="/admin" />
                    )}
                    {renderAddDocumentModal()}
                    {renderUpdateDocumentModal()}
                    {renderDocumentPage()}
                  </Fragment>
                }
              />
              <Route
                path="/helper-login/clients"
                element={
                  <>
                    {account.role === Role.owner && (
                      <Navigate replace to="/documents" />
                    )}
                    {account.role === Role.admin && (
                      <Navigate replace to="/admin" />
                    )}
                    {account.role === Role.helper && renderMyClients()}
                  </>
                }
              />
              <Route
                path="/helper-login/clients/:id/documents"
                element={
                  <>
                    {account.role === Role.owner && (
                      <Navigate replace to="/documents" />
                    )}
                    {account.role === Role.admin && (
                      <Navigate replace to="/admin" />
                    )}
                    {renderAddDocumentModal()}
                    {renderUpdateDocumentModal()}
                    {renderDocumentPage()}
                  </>
                }
              />
              <Route
                path="/admin"
                element={
                  <>
                    {account.role === Role.owner && (
                      <Navigate replace to="/documents" />
                    )}
                    {account.role === Role.helper && (
                      <Navigate replace to="/helper-login/clients" />
                    )}
                    {renderAdminPage()}
                  </>
                }
              />
              <Route
                path="/admin"
                element={
                  <>
                    {account.role === Role.owner && (
                      <Navigate replace to="/documents" />
                    )}
                    {account.role === Role.helper && (
                      <Navigate replace to="/helper-login/clients" />
                    )}
                    {renderAdminPage()}
                  </>
                }
              />
              <Route
                path="/bring-your-key"
                element={renderBringYourKeyPage()}
              />
              {/* Dev links for testing */}
              {process.env.NODE_ENV === "development" && (
                <>
                  <Route path="/checkout" element={renderCheckoutPage()} />
                  <Route
                    path="/notary-pdf-test"
                    element={<NotaryPdfTestPage />}
                  />
                </>
              )}
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default MainContainer;
