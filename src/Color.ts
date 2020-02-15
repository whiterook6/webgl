export class Color {

  /**
   * Given a hex string, return an rgba color as an array of floats:
   * [red, green, blue, alpha]
   * 
   * @param hex string a css-style hex code representing either RGB or RGBA as 00-ff components. For
   * RGB (no alpha) hex strings, alpha is set to FF (1.0).
   */
  public static fromHex(hex: string): [number, number, number, number]{
    if (hex.length !== 7 && hex.length !== 9) {
       // includes "#" at start
      console.warn(`Invalid hex code: ${hex}: invalid length`);
      return [0, 0, 0, 1];
    }

    if (!(/\#[0-9a-fA-F]+/.test(hex))) {
      console.warn(`Invalid hex code: ${hex}: doesn't match regex`);
      return [0, 0, 0, 1];
    }

    if (hex.length === 7){
      return [
        parseInt(hex.substr(1, 2), 16) / 255,
        parseInt(hex.substr(3, 2), 16) / 255,
        parseInt(hex.substr(5, 2), 16) / 255,
        1.0
      ];

    } else {
      return [
        parseInt(hex.substr(1, 2), 16) / 255,
        parseInt(hex.substr(3, 2), 16) / 255,
        parseInt(hex.substr(5, 2), 16) / 255,
        parseInt(hex.substr(7, 2), 16) / 255,
      ];
    }
  }
}