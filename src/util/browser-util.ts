export const handleIOSBrowser = () => {
  const ua = window.navigator.userAgent;
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
  const webkit = !!ua.match(/WebKit/i);
  const iOSSafari = iOS && webkit && !ua.match(/CriOS/i);
  if (iOSSafari) {
    (document.getElementsByClassName(
      'section-contents'
    )[0] as any).style.padding = '10px 0 90px 0';
  }
};
