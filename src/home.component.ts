import { Component, inject, NO_ERRORS_SCHEMA, signal } from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptRouterModule,
  RouterExtensions,
} from "@nativescript/angular";
import { MenuSelectedEvent } from "./native-views/menus";
import { Application, Dialogs, ImageSymbolEffect } from "@nativescript/core";

type Driver = {
  name: string;
  icon: string;
};

@Component({
  selector: "ns-home",
  templateUrl: "./home.component.html",
  imports: [NativeScriptCommonModule, NativeScriptRouterModule],
  schemas: [NO_ERRORS_SCHEMA],
})
export class HomeComponent {
  router = inject(RouterExtensions);
  driverOptions: Driver[] = [
    {
      name: `Tim 👨🏻`,
      icon: "steeringwheel.and.hands",
    },
    {
      name: `Sally 👩🏽‍🍳`,
      icon: "steeringwheel.and.hands",
    },
    {
      name: `Marc 👨🏻‍🍳`,
      icon: "steeringwheel.and.hands",
    },
  ];
  currentDriver = signal<Driver>(this.driverOptions[0]);
  orderTime = signal<number>(0);
  orderInProgress = signal(false);
  delivered = signal(false);
  symbolEffect: ImageSymbolEffect;

  constructor() {
    if (__APPLE__) {
      const effect = new ImageSymbolEffect(
        NSSymbolWiggleEffect.effect().effectWithByLayer()
      );
      effect.options = NSSymbolEffectOptions.optionsWithSpeed(
        0.9
      ).optionsWithRepeatBehavior(
        NSSymbolEffectOptionsRepeatBehavior.behaviorPeriodicWithDelay(0.3)
      );
      this.symbolEffect = effect;
    }
    Application.on(Application.resumeEvent, () => {
      if (this.delivered() && !this.router.router.url?.includes("detail")) {
        this.router.navigate(["/detail", 1]);
      }
    });
  }

  orderNow() {
    if (!this.orderInProgress()) {
      this.orderInProgress.set(true);
      this.orderTime.set(new Date().getTime());
      this.delivered.set(false);
      if (__APPLE__) {
        // populate widget data
        AppleWidgetUtils.updateDataWithKey(
          "widgetData",
          JSON.stringify({
            pizzas: [
              "Pepperoni",
              "Supreme",
              "Hawaiian",
              "Meat Lovers",
              "Margherita",
            ],
            orderTime: this.orderTime(),
            delivered: false,
          })
        );
        AppleWidgetUtils.startActivity({
          message: `${this.currentDriver().name} is on his way!`,
          deliveryTime: 60,
          numberOfPizzas: 5,
          totalAmount: "$49.99",
        });
        AppleWidgetUtils.updateWidget();
      }
    }
  }

  changeOrder(event: MenuSelectedEvent) {
    if (!this.orderInProgress()) {
      return;
    }
    const option = event.data.option as Driver;
    this.currentDriver.set(option);
    const isSally = this.currentDriver().name.includes("Sally");
    if (__APPLE__) {
      AppleWidgetUtils.updateDataWithKey(
        "widgetData",
        JSON.stringify({
          pizzas: ["Greek", "Sicilian", "Chicago"],
          orderTime: new Date().getTime(),
          delivered: false,
        })
      );
      AppleWidgetUtils.updateActivity({
        message: `${this.currentDriver().name} is on ${
          isSally ? "her" : "his"
        } way!`,
        deliveryTime: 15,
      });
      AppleWidgetUtils.updateWidget();
    }
  }

  orderDelivered() {
    if (!this.orderInProgress()) {
      return;
    }
    this.delivered.set(true);
    this.orderInProgress.set(false);
    if (__APPLE__) {
      AppleWidgetUtils.updateDataWithKey(
        "widgetData",
        JSON.stringify({
          pizzas: ["Greek", "Sicilian", "Chicago"],
          orderTime: new Date().getTime(),
          delivered: true,
        })
      );
      setTimeout(() => {
        AppleWidgetUtils.updateActivity({
          message: `${this.currentDriver().name} is here!`,
          deliveryTime: 0,
        });
        AppleWidgetUtils.updateWidget();
      });
    }
  }

  async cancelOrder() {
    if (!this.orderInProgress()) {
      return;
    }
    const ok = await Dialogs.confirm({
      title: "Are you sure?",
      message: `This will completely cancel your order.`,
      okButtonText: `Yes, Cancel!`,
      cancelButtonText: `Nevermind`,
    });
    if (!ok) {
      return;
    }
    this.resetOrders();
    if (__APPLE__) {
      AppleWidgetUtils.cancelActivity({
        message: "Order Canceled.",
      });
      AppleWidgetUtils.removeDataWithKey("widgetData");
      AppleWidgetUtils.updateWidget();
    }
  }

  resetOrders() {
    this.delivered.set(false);
    this.orderInProgress.set(false);
    this.orderTime.set(0);
    this.currentDriver.set(this.driverOptions[0]);
  }
}
