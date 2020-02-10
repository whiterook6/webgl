export class Color {
  public static fromHex(hex: string){
    if (hex.length !== 7 && hex.length !== 9){
      return [0, 0, 0, 1];
    }
    if (!(/\#[0-9a-fA-F]+/.test(hex))){
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