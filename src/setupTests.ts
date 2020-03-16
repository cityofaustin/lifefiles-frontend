import * as dotenv from 'dotenv';
import * as path from 'path';
import { configure } from 'enzyme';
import React16Adapter from 'enzyme-adapter-react-16';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
configure({ adapter: new React16Adapter() });
