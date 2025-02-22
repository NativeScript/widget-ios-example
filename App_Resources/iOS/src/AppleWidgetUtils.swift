import Foundation
import UIKit
import ActivityKit
import WidgetKit
import SharedWidget

@objcMembers
public class AppleWidgetUtils: NSObject {
    
    // Live Activity Handling
    public static func startActivity(_ data: NSDictionary) {
        if ActivityAuthorizationInfo().areActivitiesEnabled {
			let numberOfPizzas = data.object(forKey: "numberOfPizzas") as! Int
            let totalAmount = data.object(forKey: "totalAmount") as! String
            let attrs = PizzaModel(numberOfPizzas: numberOfPizzas, totalAmount: totalAmount)
            
			let message = data.object(forKey: "message") as! String
            let deliveryTime = data.object(forKey: "deliveryTime") as! Double
            let initialStatus = PizzaModel.DeliveryStatus(
                message: message, deliveryTime: deliveryTime)
            let content = ActivityContent(state: initialStatus, staleDate: nil)
            
            do {
                let activity = try Activity<PizzaModel>.request(
                    attributes: attrs,
                    content: content,
                    pushType: nil)
                print("Requested a Live Activity \(activity.id)")
            } catch (let error) {
                print("Error requesting Live Activity \(error.localizedDescription)")
            }
        }
    }
    public static func updateActivity(_ data: NSDictionary) {
        if ActivityAuthorizationInfo().areActivitiesEnabled {
            Task {
				let message = data.object(forKey: "message") as! String
                let deliveryTime = data.object(forKey: "deliveryTime") as! Double
                let status = PizzaModel.DeliveryStatus(
                    message: message, deliveryTime: deliveryTime)
                let content = ActivityContent(state: status, staleDate: nil)
                
                for activity in Activity<PizzaModel>.activities {
                    await activity.update(content)
                }
            }
        }
    }
    public static func cancelActivity(_ data: NSDictionary) {
        if ActivityAuthorizationInfo().areActivitiesEnabled {
            Task {
				let message = data.object(forKey: "message") as! String
                let status = PizzaModel.DeliveryStatus(
                    message: message, deliveryTime: 0)
                let content = ActivityContent(state: status, staleDate: nil)
                
                for activity in Activity<PizzaModel>.activities {
                    await activity.end(content, dismissalPolicy: .immediate)
                }
            }
        }
    }
    public static func getData(key: String) -> String? {
		guard let sharedDefaults = UserDefaults(suiteName: "group.org.nativescript.nsiosliveactivity") else {
			return nil
		}
		return sharedDefaults.object(forKey: key) as? String
	}
    public static func updateData(key: String, _ data: String) {
		guard let sharedDefaults = UserDefaults(suiteName: "group.org.nativescript.nsiosliveactivity") else {
			return
		}
		sharedDefaults.set(data, forKey: key)
    	sharedDefaults.synchronize()
	}
	public static func removeData(key: String) {
		guard let sharedDefaults = UserDefaults(suiteName: "group.org.nativescript.nsiosliveactivity") else {
			return
		}
		sharedDefaults.removeObject(forKey: key)
        sharedDefaults.synchronize()
	}
    
    // Home Screen Widget Handling
    public static func updateWidget() {
        if #available(iOS 14.0, *) {
            Task.detached(priority: .userInitiated) {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }
    }
}
