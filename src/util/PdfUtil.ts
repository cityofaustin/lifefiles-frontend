import jsPDF from 'jspdf';
import { ImageDetail } from './ImageUtil';
// https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
import Caveat from '../fonts/Caveat/Caveat-normal';
// import AcroFormTextField from 'jspdf';

export default class PdfUtil {
  static async stitchTogetherPdf(
    scannedImage: ImageDetail,
    notaryDigitalSeal: ImageDetail,
    documentDID: string
  ) {
    const pageWidth = 632,
      pageHeight = 446.5,
      lineHeight = 1.8,
      margin = 64,
      maxLineWidth = pageWidth - margin,
      fontSize = 24,
      ptsPerInch = 72,
      oneLineHeight = (fontSize * lineHeight) / ptsPerInch;
    const doc = new jsPDF({
      // https://rawgit.com/MrRio/jsPDF/master/docs/jsPDF.html
      orientation: 'landscape', // "portrait" or "landscape
      unit: 'px', // "mm", "cm", "m", "in" or "px"
      format: 'a4',
      lineHeight
    });
    doc.setProperties({ title: 'Notarized Document' });

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

    doc.addImage(scannedImage.base64, scannedImage.imageType, 223.2, 14, newOrigWidth, newOrigHeight);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(5 * 6);
    doc.text('Certified Copy of a Non-Recordable Document', margin, 157);

    doc.setFontSize(4 * 6);
    doc.text('State of Texas', margin, 194);

    const text =
      'County of  Travis .\n' +
      'On this date,  Jan 1, 2021  , I certify that the preceding of attached document, is a true, exact, complete, and unaltered copy\n' +
      'made by me of   Insurance Card   , presented to me by the document’s custodian,   Janice Sample  , and that, to the best\n' +
      'of my knowledge, the photocopied document is neither a public record not a publicly recordable document, certified copies of\n' +
      'which are available from an official source other than a notary.';
    const textLines = doc.setFont('helvetica', 'neue').setFontSize(2.3 * 6).splitTextToSize(text, maxLineWidth);
    doc.text(textLines, margin, 220);
    doc.setLineWidth(0.5);
    doc.line(margin + 45, 222, margin + 80, 222);
    doc.line(margin + 55, 222 + 18.5, margin + 110, 222 + 18.5);
    doc.line(margin + 65, 222 + 18.5 * 2, margin + 140, 222 + 18.5 * 2);
    doc.line(margin + 338, 222 + 18.5 * 2, margin + 410, 222 + 18.5 * 2);

    doc.addImage(notaryDigitalSeal.base64, notaryDigitalSeal.imageType, margin, 312, newSealWidth, newSealHeight);
    doc.line(margin, 350, 160, 350);
    doc.setFontSize(2.5 * 6);
    doc.text('Notary Seal', margin, 364);

    doc.setFont('Caveat', 'normal');
    doc.setFontSize(4 * 6);
    doc.text('John Public', 288, 321 + 12);
    doc.line(288, 350, 384, 350);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(2.3 * 6);
    doc.text('(Signature of notary)', 288, 364);

    doc.setFontSize(4 * 6); // 4 * 6 factor of 6
    doc.text(documentDID, margin, 410.5);

    const pdfArrayBuffer = doc.output('arraybuffer');
    return { pdfArrayBuffer, doc };
  }
}
