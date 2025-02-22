import SwiftUI
import WidgetKit

/**
 * Widget data shared between the app and the widget extension.
 */
struct WidgetData: Codable {
    let pizzas: [String]
    let orderTime: Double
    let delivered: Bool
}

struct Provider: TimelineProvider {
    
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), pizza: "Pepperoni", delivered: false, orderTime: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), pizza: "Pepperoni", delivered: false, orderTime: Date())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping @Sendable (Timeline<Entry>) -> ()) {
        var entries: [SimpleEntry] = []

        if let sharedDefaults = UserDefaults(suiteName: "group.org.nativescript.nsiosliveactivity") {
            let currentDate = Date()
            if let jsonString = sharedDefaults.string(forKey: "widgetData") {
                if let jsonData = jsonString.data(using: .utf8) {
                    do {
                        let widgetData = try JSONDecoder().decode(WidgetData.self, from: jsonData)
                        let pizzas = widgetData.pizzas
                        let orderTime = Date(timeIntervalSince1970: widgetData.orderTime/1000)
                        let delivered = widgetData.delivered
                        
                        // Generate a timeline of entries 1 second apart, starting from the current date.
                        for secondOffset in 0..<pizzas.count {
                            let entryDate = Calendar.current.date(
                                byAdding: .second, value: secondOffset, to: currentDate)!
                            let entry = SimpleEntry(date: entryDate, pizza: secondOffset < pizzas.count ? pizzas[secondOffset] : pizzas[0], delivered: delivered, orderTime: orderTime)
                            entries.append(entry)
                        }
                    } catch {
                        print("Failed to decode JSON: (error)")
                    }
                }
            } else {
                let entry = SimpleEntry(date: currentDate, pizza: "", delivered: false, orderTime: nil)
                entries.append(entry)
            }
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }

//    func relevances() async -> WidgetRelevances<Void> {
//        // Generate a list containing the contexts this widget is relevant in.
//    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let pizza: String
    let delivered: Bool
    let orderTime: Date?
}

struct WidgetView: View {
    @Environment(\.widgetFamily) var widgetFamily
    var entry: Provider.Entry
    
    var body: some View {
        VStack {
            if (entry.pizza != "") {
                Spacer()
                Image(systemName: entry.delivered ? "face.smiling.inverse" : "car.side")
                    .resizable()
                    .scaledToFit()
                    .frame(width: iconSize(for: widgetFamily), height: iconSize(for: widgetFamily))
                    .foregroundColor(entry.delivered ? .blue : .green)
                Spacer()
                if (entry.delivered) {
                    Text("Pizza Delivered!")
                        .font(.system(size: fontSize(for: widgetFamily), weight: .bold))
                        .foregroundStyle(.white)
                } else {
                    HStack(spacing: 4) {
                        Text("Ordered:")
                            .font(.system(size: fontSize(for: widgetFamily)))
                            .foregroundStyle(.white)
                        Text(entry.orderTime!, style: .time)
                            .font(.system(size: fontSize(for: widgetFamily), weight: .bold))
                            .foregroundStyle(.white)
                    }
                    HStack(spacing: 4) {
                        Text("Pizza:")
                            .font(.system(size: fontSize(for: widgetFamily)))
                            .foregroundStyle(.white)
                        Text(entry.pizza)
                            .font(.system(size: fontSize(for: widgetFamily), weight: .bold))
                            .foregroundStyle(.white)
                    } 
                }
                Spacer() 
            } else {
                Spacer()
                Image(systemName: "car.side.rear.open")
                    .resizable()
                    .scaledToFit()
                    .frame(width: iconSize(for: widgetFamily), height: iconSize(for: widgetFamily))
                    .foregroundColor(.gray)
                Spacer()
                Text("Awaiting orders...")
                    .foregroundStyle(.white)
                Spacer()
            }
        }.frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func iconSize(for family: WidgetFamily) -> CGFloat {
        switch family {
        case .systemSmall:
            return 65
        case .systemMedium:
            return 85
        case .systemLarge:
            return 150
        default:
            return 65 
        }
    }

    private func fontSize(for family: WidgetFamily) -> CGFloat {
        switch family {
        case .systemSmall:
            return 12
        case .systemMedium:
            return 14
        case .systemLarge:
            return 18
        default:
            return 14 
        }
    }
}

@available(iOSApplicationExtension 17.0, *)
struct PizzaHomeScreenWidget: Widget {
    let kind: String = "widget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            WidgetView(entry: entry)
                .containerBackground(for: .widget) {
                    LinearGradient(
                        gradient: Gradient(colors: [Color.black.opacity(0.6), Color.black]),
                        startPoint: .top,
                        endPoint: .bottom
                    )
                }
        }
        .configurationDisplayName("Pizza Widget")
        .description("Pizza delivery service.")
    }
}

#Preview(as: .systemSmall) {
    PizzaHomeScreenWidget()
} timeline: {
    SimpleEntry(date: .now, pizza: "Pepperoni", delivered: false, orderTime: Date())
    SimpleEntry(date: .now, pizza: "Hawaiian", delivered: false, orderTime: Date())
}
