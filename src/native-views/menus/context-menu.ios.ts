import { Property, View } from '@nativescript/core';

import { Menu } from './menu-base.ios';
import type { MenuButtonAction } from './common';

const CONTEXT_MENU_SYMBOL = Symbol('contextMenu');

const contextMenuProperty = new Property<View, Array<MenuButtonAction> | MenuButtonAction>({
  name: 'contextMenu',
  valueChanged(target, oldValue, newValue) {
    // console.log('contextMenu valueChanged', target, oldValue, newValue);
    target[CONTEXT_MENU_SYMBOL] ??= new ContextMenu(target);
    target[CONTEXT_MENU_SYMBOL].options = newValue;
    target[CONTEXT_MENU_SYMBOL].resetMenu();
  },
});
contextMenuProperty.register(View);

@NativeClass()
class ContextMenuDelegate extends NSObject implements UIContextMenuInteractionDelegate {
  static ObjCProtocols = [UIContextMenuInteractionDelegate];
  targetView: UIView;
  menu: UIMenu;

  static initWithTargetViewAndMenu(targetView: UIView, menu: UIMenu): ContextMenuDelegate {
    const delegate = new ContextMenuDelegate();
    delegate.targetView = targetView;
    delegate.menu = menu;
    return delegate;
  }

  contextMenuInteractionConfigurationHighlightPreviewForItemWithIdentifier(
    interaction: UIContextMenuInteraction,
    configuration: UIContextMenuConfiguration,
    identifier: any
  ): UITargetedPreview {
    // console.log(
    //   'contextMenuInteractionConfigurationHighlightPreviewForItemWithIdentifier',
    //   identifier,
    //   configuration,
    //   interaction
    // );
    const previewConfiguration = UIPreviewParameters.alloc().init();
    previewConfiguration.backgroundColor = UIColor.clearColor;

    if (this.targetView?.layer?.mask) {
      const mask = this.targetView.layer.mask as CAShapeLayer;
      const path = mask.path;
      if (path) {
        const newPath = UIBezierPath.bezierPathWithCGPath(path);
        previewConfiguration.visiblePath = newPath;
        previewConfiguration.shadowPath = newPath;
      }
    }

    return UITargetedPreview.alloc().initWithViewParameters(this.targetView, previewConfiguration);
  }

  contextMenuInteractionConfigurationForMenuAtLocation(
    interaction: UIContextMenuInteraction,
    location: CGPoint
  ): UIContextMenuConfiguration {
    // console.log('contextMenuInteractionConfigurationForMenuAtLocation', location);
    return UIContextMenuConfiguration.configurationWithIdentifierPreviewProviderActionProvider(null, null, () => {
      return this.menu;
    });
  }
}

export class ContextMenu extends Menu {
  private contextMenuDelegate: ContextMenuDelegate;
  private currentInteraction: UIContextMenuInteraction;

  resetMenu() {
    if (!this.options) {
      return;
    }

    if (!this.targetView?.ios) {
      this.targetView.once('loaded', () => {
        this.resetMenu();
      });
      return;
    }

    const targetView = this.targetView.ios as UIView;

    if (this.currentInteraction) {
      targetView.removeInteraction(this.currentInteraction);
    }

    if (Array.isArray(this.options) && this.options.length === 0) {
      // skip empty menus
      return;
    }

    const menu = this.getMenu();
    this.contextMenuDelegate = ContextMenuDelegate.initWithTargetViewAndMenu(targetView, menu);
    this.currentInteraction = UIContextMenuInteraction.alloc().initWithDelegate(this.contextMenuDelegate);
    targetView.addInteraction(this.currentInteraction);
  }
}
