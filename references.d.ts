/// <reference path="./node_modules/@nativescript/types/index.d.ts" />
/// <reference path="./node_modules/@nativescript/types-ios/lib/ios/objc-x86_64/objc!Symbols.d.ts" />

/**
 * Customize for your own Apple Widget Data
 */
declare interface AppleWidgetModelData {
  numberOfPizzas: number;
  totalAmount: string;
  message: string;
  deliveryTime: number;
}
declare class AppleWidgetUtils extends NSObject {
  static startActivity(data: AppleWidgetModelData): void;
  static updateActivity(
    data: Pick<AppleWidgetModelData, "message" | "deliveryTime">
  ): void;
  static cancelActivity(data: Pick<AppleWidgetModelData, "message">): void;
  static updateWidget(): void;
  static updateDataWithKey(key: string, data: string): void;
  static getDataWithKey(key: string): string;
  static removeDataWithKey(key: string): void;
}
