declare module 'alpinejs' {
  interface Alpine {
    data(name: string, callback: () => any): void;
    store(name: string, data?: any): any;
    start(): void;
    version: string;
  }

  const Alpine: Alpine;
  export default Alpine;
}