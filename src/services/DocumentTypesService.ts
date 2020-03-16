import AgentService from './APIService';

const PATH = '/documenttypes';

class DocumentTypesService extends AgentService {

  static async get(): Promise<any> {
    const response = await super.get(PATH);
    return response;
  }

}

export default DocumentTypesService;
