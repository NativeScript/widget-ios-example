import { Button, Property, View } from '@nativescript/core';

import { Menu } from './menu-base.ios';
import type { MenuButtonAction } from './common';

const BUTTON_MENU_SYMBOL = Symbol('contextMenu');

const contextMenuProperty = new Property<View, Array<MenuButtonAction> | MenuButtonAction>({
  name: 'menu',
  valueChanged(target, oldValue, newValue) {
    // console.log('button menu valueChanged', target, oldValue, newValue);
    target[BUTTON_MENU_SYMBOL] ??= new ButtonMenu(target);
    target[BUTTON_MENU_SYMBOL].options = newValue;
    target[BUTTON_MENU_SYMBOL].resetMenu();
  },
});
contextMenuProperty.register(View);

export class ButtonMenu extends Menu {
  fakeButton?: UIButton;

  resetMenu() {
    if (!this.options) {
      return;
    }

    if (!this.targetView.ios) {
      this.targetView.once('loaded', () => {
        this.resetMenu();
      });
      return;
    }

    let targetView: UIView | UIButton = this.targetView.ios;
    let targetButton: UIButton;

    if (!(targetView instanceof UIButton)) {
      if (!this.fakeButton) {
        this.fakeButton = UIButton.new();
        this.fakeButton.backgroundColor = UIColor.clearColor;
        this.fakeButton.frame = targetView.frame;
        this.fakeButton.autoresizingMask = UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleHeight;
        targetView.addSubview(this.fakeButton);
      }
      // always bring the fake button to the front in case the targetView was modified elsewhere
      targetView.bringSubviewToFront(this.fakeButton);
      targetButton = this.fakeButton;
    } else {
      targetButton = targetView;
    }

    const menu = this.getMenu();
    targetButton.menu = menu;
    targetButton.showsMenuAsPrimaryAction = true;
  }
}
