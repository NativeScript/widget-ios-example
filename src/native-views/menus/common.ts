import { Color, View } from '@nativescript/core';

export interface MenuSelectedEvent<T = MenuButtonAction> {
  eventName: 'menuSelected';
  object: View;
  data: {
    option: T;
  };
}

export type SystemIcon =
  | string
  | {
      systemIcon: string;
      color?: Color | string;
    };

export interface ImageIcon {
  src: string;
  color?: Color | string;
}

export interface FontIcon {
  fontFamily: string;
  text: string;
  fontWeight?: number;
  color?: Color | string;
}

export interface MenuButtonAction<T = any> {
  id?: number;
  name?: string;
  icon?: SystemIcon | ImageIcon | FontIcon;
  iconColor?: Color | string;
  destructive?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  keepsMenuOpen?: boolean;
  value?: T;
  children?: Array<MenuButtonAction>;
  childrenStyle?: 'inline' | 'dropdown' | 'palette';
  preferredSize?: 'small' | 'medium' | 'large';
  action?: (action: MenuButtonAction<T>) => void;

  state?: 'on' | 'off' | 'mixed';
}
