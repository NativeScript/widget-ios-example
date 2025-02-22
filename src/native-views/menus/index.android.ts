import { Button } from '@nativescript/core';

export * from './common';

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
