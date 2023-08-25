declare module '*.svg' {
  const svg: React.VFC<React.SVGProps<SVGSVGElement>>;
  export default svg;
}

declare module '*.css' {
  const resource: { [key: string]: string };
  export = resource;
}

declare module '*.less' {
  const resource: { [key: string]: string };
  export = resource;
}
