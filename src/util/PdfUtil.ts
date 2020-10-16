import jsPDF from 'jspdf';
import { ImageDetail } from './ImageUtil';
// https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
import Caveat from '../fonts/Caveat/Caveat-normal';
import Arial from '../fonts/arial-normal';
import StringUtil from './StringUtil';
import { format, getDay } from 'date-fns';
// import AcroFormTextField from 'jspdf';

export default class PdfUtil {
  static async stitchTogetherPdf(
    scannedImage: ImageDetail,
    stateName: string,
    county: string,
    notarizedDate: Date,
    documentType: string,
    ownerFullname: string,
    notaryDigitalSeal: ImageDetail,
    notaryFullname: string,
    documentDID: string
  ) {
    // const dateString = 'Dec 31, 2021';
    let dateString = format(notarizedDate, 'MMM dd, y');
    if (getDay(notarizedDate) < 10) {
      dateString += ' ';
    }
    const pageWidth = 632;
    // pageHeight = 446.5,
    const lineHeight = 1.8;
    const margin = 64;
    const maxLineWidth = pageWidth - margin * 2 + 10;
    // fontSize = 24,
    // ptsPerInch = 72;
    // oneLineHeight = (fontSize * lineHeight) / ptsPerInch;
    const doc: jsPDF = new jsPDF({
      // https://rawgit.com/MrRio/jsPDF/master/docs/jsPDF.html
      orientation: 'landscape', // "portrait" or "landscape
      unit: 'px', // "mm", "cm", "m", "in" or "px"
      format: 'a4',
      lineHeight,
    });
    doc.setProperties({ title: 'Notarized Document' });
    // adding some padding to the variable fields
    county = StringUtil.stringPaddedCenter(county, 14 - county.length);
    documentType = StringUtil.stringPaddedCenter(
      documentType,
      20 - documentType.length
    );
    ownerFullname = StringUtil.stringPaddedCenter(
      ownerFullname,
      30 - ownerFullname.length
    );
    // console.log(`original width ${scannedImage.width} height ${scannedImage.height}`);
    // newH      x    160*1194/861 for example
    // -----  = -----
    // origH    origW
    const newOrigHeight = 118;
    const newOrigWidth =
      (newOrigHeight * scannedImage.width) / scannedImage.height;
    // console.log(`original new width ${newOrigWidth} height ${newOrigHeight}`);
    // console.log(`original2 width ${notaryDigitalSeal.width} height ${notaryDigitalSeal.height}`);
    const newSealHeight = 31.5;
    const newSealWidth =
      (newSealHeight * notaryDigitalSeal.width) / notaryDigitalSeal.height;
    // https://stackoverflow.com/questions/58449153/jspdf-error-font-does-not-exist-in-vfs-vuejs
    doc.addFileToVFS('Caveat-normal.ttf', Caveat);
    doc.addFont('Caveat-normal.ttf', 'Caveat', 'normal');
    // console.log(doc.getFontList());

    doc.addImage(
      scannedImage.base64,
      scannedImage.imageType,
      223.2,
      14,
      newOrigWidth,
      newOrigHeight
    );

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(5 * 6);
    doc.text('Certified Copy of a Non-Recordable Document', margin, 157);

    doc.setFontSize(4 * 6);
    doc.text(`State of ${stateName}`, margin, 194);

    const text1 =
      `County of ${county} .\n` +
      `On this date,  ${dateString} , I certify that the preceding of attached document, is a true, exact, complete, and unaltered copy ` +
      `made by me of ${documentType}`;
    const text2 = `, presented to me by the document’s custodian, ${ownerFullname} ,`;
    const text3 =
      `and that, to the best ` +
      'of my knowledge, the photocopied document is neither a public record not a publicly recordable document, certified copies of ' +
      'which are available from an official source other than a notary.';
    const textLines1 = doc
      .setFont('Times', 'normal')
      .setFontSize(2.3 * 6)
      .splitTextToSize(text1, maxLineWidth);
    const textLines2 = doc
      .setFont('Times', 'normal')
      .setFontSize(2.3 * 6)
      .splitTextToSize(text3, maxLineWidth);
    doc.text(textLines1, margin, 220);
    doc.text(text2, margin + 170, 220 + 18.5 * 2);
    doc.text(textLines2, margin, 220 + 18.5 * 3);
    doc.setLineWidth(0.5);
    doc.line(margin + 45, 222, margin + 115, 222); // county
    doc.line(margin + 55, 222 + 18.5, margin + 115, 222 + 18.5); // date
    doc.line(margin + 65, 222 + 18.5 * 2, margin + 165, 222 + 18.5 * 2); // doc type
    doc.line(margin + 368, 222 + 18.5 * 2, margin + 515, 222 + 18.5 * 2); // owner

    doc.addImage(
      notaryDigitalSeal.base64,
      notaryDigitalSeal.imageType,
      margin,
      312,
      newSealWidth,
      newSealHeight
    );
    doc.line(margin, 350, 160, 350);
    doc.setFontSize(2.5 * 6);
    doc.setFont('Helvetica', 'normal');
    doc.text('Notary Seal', margin, 364);

    doc.setFont('Caveat', 'normal');
    doc.setFontSize(4 * 6);
    doc.text(notaryFullname, 288, 321 + 12);
    doc.line(288, 350, 384, 350);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(2.3 * 6);
    doc.text('(Signature of notary)', 288, 364);

    doc.setFontSize(4 * 6); // 4 * 6 factor of 6
    doc.text(documentDID, margin, 410.5);

    const pdfArrayBuffer = doc.output('arraybuffer');
    return { pdfArrayBuffer, doc };
  }

  static async stitchTogetherRecordablePdf(
    scannedImage: ImageDetail,
    stateName: string,
    county: string,
    notarizedDate: Date,
    documentType: string,
    ownerFullname: string,
    notaryDigitalSeal: ImageDetail,
    notaryFullname: string,
    documentDID: string
  ) {
    // const dateString = 'Dec 31, 2021';
    let dateString = StringUtil.stringPaddedCenter(format(notarizedDate, 'MMM dd, y'), 2);
    if (getDay(notarizedDate) < 10) {
      dateString += ' ';
    }
    const pageWidth = 632;
    const lineHeight = 1.7;
    const margin = 0.8 * 62;
    const maxLineWidth = pageWidth - margin * 2 + 10;
    // fontSize = 24,
    // ptsPerInch = 72;
    // oneLineHeight = (fontSize * lineHeight) / ptsPerInch;
    const doc: jsPDF = new jsPDF({
      // https://rawgit.com/MrRio/jsPDF/master/docs/jsPDF.html
      orientation: 'landscape', // "portrait" or "landscape
      unit: 'px', // "mm", "cm", "m", "in" or "px"
      format: 'a4',
      lineHeight,
    });
    doc.setProperties({ title: 'Notarized Document' });
    const max = 20;
    // adding some padding to the variable fields
    county = StringUtil.truncate(county, max);
    county = StringUtil.stringPaddedCenter(
      county,
      Math.ceil((max - county.length) / 2)
    );
    county = StringUtil.truncate(county, max);

    ownerFullname = StringUtil.truncate(ownerFullname, max);
    ownerFullname = StringUtil.stringPaddedCenter(
      ownerFullname,
      Math.ceil((max - ownerFullname.length) / 2)
    );
    ownerFullname = StringUtil.truncate(ownerFullname, max);
    notaryFullname = StringUtil.truncate(notaryFullname, max);
    notaryFullname = StringUtil.stringPaddedCenter(
      notaryFullname,
      Math.ceil((max - notaryFullname.length) / 2)
    );
    notaryFullname = StringUtil.truncate(notaryFullname, max);
    documentType = StringUtil.truncate(documentType, max);
    documentType = StringUtil.stringPaddedCenter(
      documentType,
      Math.ceil((max - documentType.length) / 2)
    );
    documentType = StringUtil.truncate(documentType, max);

    // ownerFullname = StringUtil.stringPaddedCenter(
    //   ownerFullname,
    //   30 - ownerFullname.length
    // );
    const newOrigHeight = 118;
    const newOrigWidth =
      (newOrigHeight * scannedImage.width) / scannedImage.height;
    const newSealHeight = 31.5;
    const newSealWidth =
      (newSealHeight * notaryDigitalSeal.width) / notaryDigitalSeal.height;
    // https://stackoverflow.com/questions/58449153/jspdf-error-font-does-not-exist-in-vfs-vuejs
    // https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
    doc.addFileToVFS('Caveat-normal.ttf', Caveat);
    doc.addFont('Caveat-normal.ttf', 'Caveat', 'normal');
    doc.addFileToVFS('arial-normal.ttf', Arial);
    doc.addFont('arial-normal.ttf', 'Arial', 'normal');
    console.log(doc.getFontList());

    doc.addImage(
      scannedImage.base64,
      scannedImage.imageType,
      223.2,
      0,
      newOrigWidth,
      newOrigHeight
    );

    doc.setFont('Arial', 'normal');
    doc.setFontSize(13 * 1.18);
    doc.text('Copy Certification by Document Custodian', margin, 1.67 * 75);
    doc.setFont('Arial', 'normal').setFontSize(9 * 1.18);
    const text1 = 'I ';
    doc.text(text1, margin, 1.92 * 75);
    const width1 = doc.getTextWidth(text1);
    doc.setFont('Courier', 'normal').setFontSize(9 * 1.18);
    doc.text(ownerFullname, margin + width1, 1.92 * 75);
    const width2 = doc.getTextWidth(ownerFullname);
    doc.setFont('Arial', 'normal').setFontSize(9 * 1.18);
    const text3 = ' hereby declare that the attached reproduction of ';
    doc.text(text3, margin + width1 + width2, 1.92 * 75);
    const width3 = doc.getTextWidth(text3);
    doc.setFont('Courier', 'normal').setFontSize(9 * 1.18);
    doc.text(documentType, margin + width1 + width2 + width3, 1.92 * 75);
    const width4 = doc.getTextWidth(documentType);
    doc.setFont('Arial', 'normal').setFontSize(9 * 1.18);
    const text5 = ' is a true, correct and complete photocopy of';
    doc.text(text5, margin + width1 + width2 + width3 + width4, 1.92 * 75);
    const text6 = 'the original document in my possession.';
    doc.text(text6, margin, 1.92 * 75 + 12);
    doc.setLineWidth(0.5);
    doc.line(margin + 5, 145, margin + 100, 145); // custodian
    doc.line(
      margin + 5 + width2 + width3,
      145,
      margin + 100 + width2 + width3,
      145
    ); // document type

    doc.setFont('Caveat', 'normal').setFontSize(16 * 1.18);
    doc.text(ownerFullname, margin, 2.5 * 75);
    doc.setLineWidth(0.7);
    doc.line(margin, 2.5 * 75 + 5, margin + 100, 2.5 * 75 + 5); // custodian sig
    doc.setFont('Arial', 'normal').setFontSize(9 * 1.18);
    const text8 = '(Signature of Custodian)';
    doc.text(text8, margin, 2.7 * 75);

    doc.setFont('Courier', 'normal').setFontSize(11 * 1.18);
    const widthDate = 288; // 480 far right
    doc.text(dateString, widthDate, 2.5 * 75);
    doc.line(widthDate, 2.5 * 75 + 5, widthDate + 100, 2.5 * 75 + 5); // date sig
    doc.setFont('Arial', 'normal').setFontSize(9 * 1.18);
    const text8b = '(Date Signed)';
    doc.text(text8b, widthDate, 2.7 * 75);


    doc.setFont('Arial', 'normal').setFontSize(9 * 1.18);
    doc.setLineWidth(1.1);
    doc.rect(margin - 15, 230, 560, 40, 'S');
    const text9 =
      `A notary public or other officer completing this certificate verifies only the identity of the individual who signed the document to which this certificate is ` +
      `attached, and not the truthfulness, accuracy, or validity of that document`;
    const textLines9 = doc
      .splitTextToSize(text9, maxLineWidth);
    doc.text(textLines9, margin, 3.27 * 75);

    doc.setFont('Arial', 'normal').setFontSize(14 * 1.18);
    const text10 = `State of ${stateName}`;
    doc.text(text10, margin, 3.9 * 75);
    doc.setFont('Arial', 'normal').setFontSize(10 * 1.18);
    const text11 = 'County of ';
    doc.text(text11, margin, 4.1 * 75);
    const width11 = doc.getTextWidth(text11);
    doc.setFont('Courier', 'normal').setFontSize(10 * 1.18);
    doc.text(county, margin + width11, 4.1 * 75);
    doc.setLineWidth(0.5);
    doc.line(margin + width11, 4.1 * 75 + 1, margin + width11 + 107, 4.1 * 75 + 1); // county
    doc.setFont('Arial', 'normal').setFontSize(9 * 1.18);
    const text13 = 'Signed and sworn (of affirmed) before me, ';
    doc.text(text13, margin, 4.1 * 75 + 12);
    const width13 = doc.getTextWidth(text13);
    doc.setFont('Courier', 'normal').setFontSize(9 * 1.18);
    doc.text(notaryFullname, margin + width13, 4.1 * 75 + 12);
    const width14 = doc.getTextWidth(notaryFullname);
    doc.line(margin + width13, 4.1 * 75 + 13, margin + width13 + 95, 4.1 * 75 + 13);
    doc.setFont('Arial', 'normal').setFontSize(9 * 1.18);
    const text15 = ' , Notary Public, on ';
    doc.text(text15, margin + width13 + width14, 4.1 * 75 + 12);
    const width15 = doc.getTextWidth(text15);
    doc.setFont('Courier', 'normal').setFontSize(9 * 1.18);
    doc.text(dateString, margin + width13 + width14 + width15, 4.1 * 75 + 12);
    const width16 = doc.getTextWidth(dateString);
    doc.line(margin + width13 + width14 + width15, 4.1 * 75 + 13, margin + width13 + width14 + width15 + 80, 4.1 * 75 + 13);
    doc.setFont('Arial', 'normal').setFontSize(9 * 1.18);
    const text17 = ' by ';
    doc.text(text17, margin + width13 + width14 + width15 + width16, 4.1 * 75 + 12);
    const width17 = doc.getTextWidth(text17);
    doc.setFont('Courier', 'normal').setFontSize(9 * 1.18);
    doc.text(ownerFullname, margin + width13 + width14 + width15 + width16 + width17, 4.1 * 75 + 12);
    const width18 = doc.getTextWidth(ownerFullname);
    doc.line(margin + width13 + width14 + width15 + width16 + width17, 4.1 * 75 + 13, margin + width13 + width14 + width15 + width16 + width17 + 95, 4.1 * 75 + 13);
    doc.setFont('Arial', 'normal').setFontSize(9 * 1.18);
    const text19 = 'who';
    doc.text(text19, margin + width13 + width14 + width15 + width16+ width17+width18, 4.1 * 75 + 12);
    const text20 = 'proved to me on the basis of satisfactory evidence to the person who appeared before me.';
    doc.text(text20, margin, 4.1 * 75 + 24);

    doc.setLineWidth(0.7);
    doc.addImage(
      notaryDigitalSeal.base64,
      notaryDigitalSeal.imageType,
      margin,
      4.7 * 75,
      newSealWidth,
      newSealHeight
    );
    doc.line(margin, 5.1 * 75 + 5, 160, 5.1 * 75 + 5);
    doc.setFont('Arial', 'normal').setFontSize(9 * 1.18);
    doc.text('Notary Seal', margin, 5.3 * 75);

    doc.setFont('Caveat', 'normal').setFontSize(16 * 1.18);
    doc.text(notaryFullname, 288, 5.1 * 75);
    doc.line(288, 5.1 * 75 + 5, 384, 5.1 * 75 + 5);
    doc.setFont('Arial', 'normal').setFontSize(9 * 1.18);
    doc.text('(Signature of notary)', 288, 5.3 * 75);

    doc.setFont('Arial', 'normal').setFontSize(11 * 1.18);
    doc.text(documentDID, margin, 5.8 * 75);

    const pdfArrayBuffer = doc.output('arraybuffer');
    return { pdfArrayBuffer, doc };
  }
}
