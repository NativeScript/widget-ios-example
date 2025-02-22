import WidgetKit
import SwiftUI

@main
struct PizzaBundle: SwiftUI.WidgetBundle {
	var body: some Widget {
		PizzaHomeScreenWidget()
		PizzaLiveActivity()
	}
}
