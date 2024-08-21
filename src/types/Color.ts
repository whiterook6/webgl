export type color4 = [number, number, number, number];
export type Gradient = (t: number) => color4;
export class Color {
  /**
   * Given a hex string, return an rgba color as an array of floats:
   * [red, green, blue, alpha]
   *
   * @param hex string a css-style hex code representing either RGB or RGBA as 00-ff components. For
   * RGB (no alpha) hex strings, alpha is set to FF (1.0).
   */
  public static fromHex = (hex: string): color4 => {
    if (hex.length !== 7 && hex.length !== 9) {
      // includes "#" at start
      console.warn(`Invalid hex code: ${hex}: invalid length`);
      return [0, 0, 0, 1];
    }

    if (!/\#[0-9a-fA-F]+/.test(hex)) {
      console.warn(`Invalid hex code: ${hex}: doesn't match regex`);
      return [0, 0, 0, 1];
    }

    if (hex.length === 7) {
      return [
        parseInt(hex.substr(1, 2), 16) / 255,
        parseInt(hex.substr(3, 2), 16) / 255,
        parseInt(hex.substr(5, 2), 16) / 255,
        1.0,
      ];
    } else {
      return [
        parseInt(hex.substr(1, 2), 16) / 255,
        parseInt(hex.substr(3, 2), 16) / 255,
        parseInt(hex.substr(5, 2), 16) / 255,
        parseInt(hex.substr(7, 2), 16) / 255,
      ];
    }
  };

  public static createGradient = (colors: [color4, ...color4[]]): Gradient => {
    return (t: number): color4 => {
      if (colors.length === 1 || t <= 0){
        return colors[0];
      } else if (t >= 1){
        return colors[colors.length - 1];
      }

      const index = Math.floor(t * (colors.length - 1));
      const color1 = colors[index];
      const color2 = colors[index + 1];
      const t2 = (t - index / (colors.length - 1)) * (colors.length - 1);
      return Color.interpolate(color1, color2, t2);
    }
  };

  public static interpolate = (color1: color4, color2: color4, t: number): color4 => {
    if (t <= 0){
      return color1;
    } else if (t >= 1){
      return color2;
    }

    return [
      color1[0] * (1 - t) + color2[0] * t,
      color1[1] * (1 - t) + color2[1] * t,
      color1[2] * (1 - t) + color2[2] * t,
      color1[3] * (1 - t) + color2[3] * t,
    ];
  };
}
