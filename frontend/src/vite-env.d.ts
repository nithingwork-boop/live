/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_GRAPHQL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.svg?url' {
  const url: string;
  export default url;
}

declare module '*.csv?url' {
  const url: string;
  export default url;
}

declare module '*.pdf?url' {
  const url: string;
  export default url;
}
