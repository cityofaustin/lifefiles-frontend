declare module '*.png' {
  const content: any;
  export default content;
}
declare module '*.svg' {
  const content: any;
  import React = require('react');
  export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
  export const src: string;
  export default content;
}
