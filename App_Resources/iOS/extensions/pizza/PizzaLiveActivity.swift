import ActivityKit
import SwiftUI
import WidgetKit
import Foundation
import SharedWidget
import os

struct PizzaLiveActivity: Widget {
    
	var body: some WidgetConfiguration {
		ActivityConfiguration(for: PizzaModel.self) { context in

			LockScreenView(message: context.state.message, deliveryTime: context.state.deliveryTime)
				.activityBackgroundTint(Color.black)
				.activitySystemActionForegroundColor(Color.white)

		} dynamicIsland: { context in
			DynamicIsland {
				DynamicIslandExpandedRegion(.leading) {
					Image(systemName: context.state.deliveryTime >= 0 ? "car.side.arrowtriangle.up.fill" : "face.smiling.inverse")
						.resizable()
						.scaledToFit()
						.frame(width: 50, height: 50)
						.foregroundColor(context.state.deliveryTime >= 0 ? Color.green : Color.blue)
				}
				DynamicIslandExpandedRegion(.trailing) {
					if (context.state.deliveryTime >= 0) {
						ZStack {
							ProgressView(value: context.state.deliveryTime, total: 60)
								.progressViewStyle(.circular)
								.tint(Color.green)
								.frame(width: 75, height: 75)
							Text("\(formatter.string(for: context.state.deliveryTime) ?? "") mins")
								.font(.system(size: 11)) 
								.foregroundStyle(.white)
						}.frame(width: 75, height: 75)
					} else {
						Image(systemName: "checkmark.circle.fill")
							.resizable()
							.scaledToFit()
							.frame(width: 50, height: 50)
							.foregroundColor(.blue)
					}
				}
				DynamicIslandExpandedRegion(.bottom) {
					Text("\(context.state.message)")
				}
			} compactLeading: {
				Image(systemName: context.state.deliveryTime >= 0 ? "car.side.arrowtriangle.up.fill" : "face.smiling.inverse")
					.resizable()
					.scaledToFit()
					.frame(width: 20, height: 20)
					.foregroundColor(context.state.deliveryTime >= 0 ? .green : .blue)
			} compactTrailing: {
				Image(systemName: context.state.deliveryTime >= 0 ? "timer.circle.fill" : "checkmark.circle.fill")
					.resizable()
					.scaledToFit()
					.frame(width: 20, height: 20)
					.foregroundColor(context.state.deliveryTime >= 0 ? .green : .blue)
			} minimal: {
				Text(context.state.message).font(.system(size: 12)) 
			}
			.widgetURL(URL(string: "http://www.apple.com"))
			.keylineTint(Color.red)
		}
	}

	private let formatter: NumberFormatter = {
        let formatter = NumberFormatter()
        formatter.maximumFractionDigits = 0
        formatter.minimumFractionDigits = 0
        return formatter
    }()
}

struct LockScreenView: View {
	@State private var message = ""
	@State private var deliveryTime: Double = 0
	// for console debugging
	let logger = Logger(subsystem: "org.nativescript.nsiosliveactivity.pizza", category: "Widget")

	var body: some View {
		ZStack {
			LinearGradient(
				gradient: Gradient(colors: [Color.gray.opacity(0.3), Color.black]),
				startPoint: .top,
				endPoint: .bottom
			)
			VStack {
				Spacer()
				Image(systemName: deliveryTime >= 0 ? "car.side.arrowtriangle.up.fill" : "face.smiling.inverse")
					.resizable()
					.scaledToFit()
					.frame(width: 50, height: 50)
					.foregroundColor(deliveryTime >= 0 ? .green : .blue)
				Spacer()
				Text("\(message)")
					.foregroundStyle(.white)
				Spacer()
			}
		}.frame(maxWidth: .infinity, maxHeight: .infinity)		
	}

	init(message: String = "", deliveryTime: Double = 0) {
        _message = State(initialValue: message)
        _deliveryTime = State(initialValue: deliveryTime)

        // Logs the deliveryTime at init for debugging purposes if needed
        logger.log("deliveryTime: \(deliveryTime)")
    }
}
