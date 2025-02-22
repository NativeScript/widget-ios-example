// swift-tools-version:5.9
import PackageDescription

let package = Package(
	name: "SharedWidget",
	platforms: [
		.iOS(.v13)
	],
	products: [
		.library(
			name: "SharedWidget",
			targets: ["SharedWidget"])
	],
	dependencies: [
		// Dependencies declare other packages that this package depends on.
	],
	targets: [
		.target(
			name: "SharedWidget",
			dependencies: []
		)
	]
)
