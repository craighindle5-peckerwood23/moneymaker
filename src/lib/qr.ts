import QRCode from 'qrcode';

export async function generateQRCodeDataUrl(text: string) {
  return QRCode.toDataURL(text, { margin: 1, width: 256 });
}
