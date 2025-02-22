import ActivityKit
import WidgetKit

public struct PizzaModel: ActivityAttributes {
  public typealias DeliveryStatus = ContentState

  public struct ContentState: Codable, Hashable {
    // Dynamic stateful properties about your activity go here!
    public var message: String
    public var deliveryTime: Double

    public init(message: String, deliveryTime: Double) {
      self.message = message
      self.deliveryTime = deliveryTime
    }
  }

  // Fixed non-changing properties about your activity go here!
  public var numberOfPizzas: Int
  public var totalAmount: String

  public init(numberOfPizzas: Int, totalAmount: String) {
    self.numberOfPizzas = numberOfPizzas
    self.totalAmount = totalAmount
  }
}
