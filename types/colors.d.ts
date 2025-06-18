declare module '../constants/colors' {
  export interface ColorShades {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    [key: number]: string; // This allows numeric indexing
  }

  export interface ColorsType {
    primary: ColorShades;
    secondary: ColorShades;
    // Add other color categories as needed
  }

  export const Colors: ColorsType;
}
