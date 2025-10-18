/// <reference types="vite/client" />

// Déclaration pour les imports de fichiers HTML comme strings
declare module '*.html?raw' {
  const content: string;
  export default content;
}

declare module '*.html' {
  const content: string;
  export default content;
}