
export enum ImageType {
  PNG = 'PNG',
  JPEG = 'JPEG'
}

export interface ImageDetail {
  base64: string;
  width: number;
  height: number;
  imageType: ImageType;
}

export default class ImageUtil {
  static async processImageBase64(imageBase64: string): Promise<ImageDetail> {
    const {width, height} = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({width: img.width, height: img.height});
      };
      img.onerror = reject;
      img.src = imageBase64;
    });
    let imageType;
    if (imageBase64.split(';')[0] === 'data:image/png') {
      imageType = ImageType.PNG;
    }
    if (imageBase64.split(';')[0] === 'data:image/jpeg') {
      imageType = ImageType.JPEG;
    }
    return { base64: imageBase64, width, height, imageType }
  }
}
