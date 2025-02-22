import { Color, Font, ImageSource, Utils, View } from '@nativescript/core';
import { FontIcon, MenuButtonAction, MenuSelectedEvent } from './common';

export function getColorFromUIColor(uiColor: UIColor): Color {
  const redRef = new interop.Reference<number>();
  const greenRef = new interop.Reference<number>();
  const blueRef = new interop.Reference<number>();
  const alphaRef = new interop.Reference<number>();

  uiColor.getRedGreenBlueAlpha(redRef, greenRef, blueRef, alphaRef);
  const red = redRef.value * 255;
  const green = greenRef.value * 255;
  const blue = blueRef.value * 255;
  const alpha = alphaRef.value * 255;

  return new Color(alpha, red, green, blue);
}

function getDisplayStyle(option: MenuButtonAction) {
  switch (option.childrenStyle) {
    case 'palette':
      return UIMenuOptions.DisplayAsPalette;
    case 'inline':
      return UIMenuOptions.DisplayInline;
    case 'dropdown':
    default:
      return null;
  }
}

function makeIconImage(icon: FontIcon, destructive?: boolean): ImageSource {
  const imgSource = ImageSource.fromFontIconCodeSync(
    unescape(icon.text),
    new Font(icon.fontFamily, 24, null, icon.fontWeight ?? 400),
    makeColor(icon.color, destructive)
  );

  return imgSource;
}

function makeColor(color: Color | string, destructive?: boolean): Color {
  if (!color) {
    return getColorFromUIColor(destructive ? UIColor.systemRedColor : UIColor.labelColor);
  }

  return color instanceof Color ? color.ios : new Color(color ?? 'black');
}

function getPreferredSize(option: MenuButtonAction) {
  switch (option.preferredSize) {
    case 'small':
      return UIMenuElementSize.Small;
    case 'medium':
      return UIMenuElementSize.Medium;
    case 'large':
      return UIMenuElementSize.Large;
    default:
      return UIMenuElementSize.Automatic;
  }
}

function getIconForOption(option: MenuButtonAction) {
  if (!option.icon) {
    return null;
  }

  const icon = option.icon;
  let image: UIImage;

  if (typeof icon === 'string') {
    return UIImage.systemImageNamed(icon);
  }

  if ('systemIcon' in icon) {
    image = UIImage.systemImageNamed(icon.systemIcon);
  }

  if ('src' in icon) {
    if (icon.src.startsWith('~')) {
      image = ImageSource.fromFileSync(icon.src).ios;
    } else {
      image = UIImage.imageNamed(icon.src);
    }
  }

  if ('fontFamily' in icon) {
    image = makeIconImage(icon, option.destructive).ios;
  }

  if ('color' in icon && !('fontFamily' in icon)) {
    image = image?.imageWithTintColorRenderingMode(makeColor(icon.color).ios, UIImageRenderingMode.AlwaysOriginal);
  }

  return image;
}

export class Menu {
  options: Array<MenuButtonAction> | MenuButtonAction;
  constructor(public targetView: View) {}

  getActionForOption(option: MenuButtonAction) {
    if (option.children) {
      const actions = [];
      for (let i = 0; i < option.children.length; i++) {
        const child = option.children[i];
        actions.push(this.getActionForOption(child));
      }

      let options = getDisplayStyle(option);

      if (option.destructive) {
        options |= UIMenuOptions.Destructive;
      }

      const menu = UIMenu.menuWithTitleImageIdentifierOptionsChildren(
        option.name,
        getIconForOption(option),
        option.id?.toString() ?? null,
        options,
        actions
      );

      if (Utils.SDK_VERSION >= 17.4) {
        menu.displayPreferences = UIMenuDisplayPreferences.alloc().init();
      }

      if (option.preferredSize) {
        menu.preferredElementSize = getPreferredSize(option);
      }

      return menu;
    }

    const action = UIAction.actionWithTitleImageIdentifierHandler(
      option.name ?? null,
      getIconForOption(option),
      option.id?.toString() ?? null,
      () => this.emitSelected(option)
    );

    switch (option.state) {
      case 'on':
        action.state = UIMenuElementState.On;
        break;
      case 'off':
        action.state = UIMenuElementState.Off;
        break;
      case 'mixed':
        action.state = UIMenuElementState.Mixed;
        break;
    }

    if (option.destructive) {
      action.attributes |= UIMenuElementAttributes.Destructive;
    }

    if (option.disabled) {
      action.attributes |= UIMenuElementAttributes.Disabled;
    }

    if (option.hidden) {
      action.attributes |= UIMenuElementAttributes.Hidden;
    }

    if (option.keepsMenuOpen) {
      action.attributes |= UIMenuElementAttributes.KeepsMenuPresented;
    }

    return action;
  }

  getMenu() {
    if (!this.options) {
      return;
    }

    let rootMenu: MenuButtonAction;
    if (Array.isArray(this.options)) {
      rootMenu = {
        name: '',
        icon: 'ellipsis',
        children: this.options,
        childrenStyle: 'inline',
      };
    } else {
      rootMenu = this.options;
    }

    return this.getActionForOption(rootMenu) as UIMenu;
  }

  emitSelected(option: MenuButtonAction): void {
    this.targetView.notify({
      eventName: 'menuSelected',
      object: this.targetView,
      data: {
        option,
      },
    } as MenuSelectedEvent);

    if (option.action) {
      option.action(option);
    }
  }

  resetMenu() {
    // override this method in the subclass
  }
}
