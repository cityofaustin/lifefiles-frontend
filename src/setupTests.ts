import * as dotenv from 'dotenv';
import * as path from 'path';
import { configure } from 'enzyme';
import React16Adapter from 'enzyme-adapter-react-16';
import { JSDOM } from 'jsdom';

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;

function copyProps(src, target) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  });
}

(global as any).window = window;
(global as any).document = window.document;
(global as any).navigator = {
  userAgent: 'node.js',
};
(global as any).requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0);
};
(global as any).cancelAnimationFrame = (id) => {
  clearTimeout(id);
};
copyProps(window, global);

(global as any).html2pdf = {};

import jsPDF from 'jspdf/dist/jspdf.node.debug';
// import { applyPlugin } from './node_modules/jspdf-autotable/dist/jspdf.plugin.autotable';

// applyPlugin(jsPDF);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
configure({ adapter: new React16Adapter() });
