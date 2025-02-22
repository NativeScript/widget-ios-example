import { Button } from '@nativescript/core';

export * from './common';

export * from './button-menu.ios';
export * from './context-menu.ios';

export class MenuButton extends Button {
  set options(value) {
    this.set('menu', value);

    if (!this.hasListeners('menuSelected')) {
      this.on('menuSelected', args => {
        this.notify({
          ...args,
          eventName: 'selected',
        });
      });
    }
  }
}
