export type PageSize = 'letter' | 'a4';
export type ErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export interface LogoConfig {
  dataUrl: string;
  filename: string;
}

export interface HeaderFooter {
  text?: string;
  image?: LogoConfig;
}

export interface Config {
  pageSize: PageSize;
  header?: HeaderFooter;
  footer?: HeaderFooter;
  logo?: LogoConfig;
  errorCorrection: ErrorCorrection;
  showPageNumbers: boolean;
  showUrlBelowQr: boolean;
  fgColor: string;
  bgColor: string;
}

export interface BatchRow {
  id: string;
  url: string;
  label?: string;
  valid: boolean;
}

export interface SavedBatch {
  version: 1;
  rows: Array<Pick<BatchRow, 'url' | 'label'>>;
  config: Config;
}
