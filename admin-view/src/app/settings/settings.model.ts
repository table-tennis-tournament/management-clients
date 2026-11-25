export interface Settings {
  key: string;
  value: any;
}

export interface TypeColor {
  bgColor: string;
  textColor: string;
}

/** The short names of the disciplines that have one, by discipline id. */
export interface ShortNameMap {
  [typeId: number]: string;
}

export interface TypeColorMap {
  [typeId: number]: TypeColor;
}
