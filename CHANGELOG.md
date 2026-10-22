# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/2.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-10-22

### Added

- Third-party license notices (`bin/THIRD_PARTY_LICENSES.txt`) in the plugin package.
- Help button above the property inspector that opens the project page on GitHub.

### Changed

- Unavailable values are now shown as `--` instead of placeholder values such as "0", "-18℃" or "N". Position and lap are shown as `--` outside races (e.g. free roam).
- When no telemetry is received for 3 seconds, actions now show `--` in addition to the warning icon. Peak G is kept.
- IP address and port changes in the Global settings are applied 1 second after the last edit, and the fields now show placeholders.
- Default color of the RPM Normal Zone changed from pure white to light grey (`#DEDEDE`) to reduce glare. Saved settings are not changed.

### Fixed

- Telemetry reception stopping after changing the IP address or port in the Global settings while actions are displayed.
- Speed Meter showing the speed unit (e.g. "kmh") instead of the gear in the Gear layout, and the gear flickering to "N" while shifting in the Full layout.
- G-Force Meter showing "undefined" when "Show Peak G" is turned off.
- Images failing to render when the touch display title or the font name contains characters such as `&` or `<`.
- Plugin process exiting when an error occurs repeatedly while drawing an action image. Errors are now logged instead.
- Power & Torque and G-Force Meter failing to draw when the saved action settings contain an unknown unit preset or a non-numeric scale.
- Suspension Travel and G-Force Meter outputting invalid drawing values (or "NaN") when telemetry values are not finite numbers.
- Log scope names being minified (e.g. "An") in release builds.
- Actions showing meaningless values (e.g. "R", "-18℃", "POS 0") while in game menus or paused. The last values are now kept.
- Effective frame rate being lower than the configured FPS (e.g. about 13 FPS at 15 FPS).
- Actions briefly showing no data after switching pages. The latest telemetry is now shared by all actions.
- Reception resuming with the previous IP address and port after an invalid value had stopped it, and frame rate changes not being applied while the IP address or port was invalid.
- Port values such as "0x5DC0" or " 24000" being accepted.
- Actions keeping stale values after a socket error such as a port conflict. They now show `--` after 3 seconds, like a normal timeout.

## [1.0.1] - 2026-08-02

### Fixed

- Display 0 when engine power or torque values are negative (e.g. during engine braking).

### Changed

- Expanded Global tab settings description (Font, Frame Rate, Connection, RPM Zone Colors) in README.md under usage instructions.
- Updated release roadmap status for Milestone 1 in `docs/marketplace/roadmap.md`.

## [1.0.0] - 2026-07-28

### Added

- **Speed Meter action**: Displays current vehicle speed in km/h or mph on key and touch display.
- **Race Info action**: Displays lap times, current lap, position, and elapsed race time.
- **Tire Temperature action**: Monitors individual tire temperatures with temperature-based color indication.
- **Suspension Travel action**: Visualizes real-time suspension movement for all four wheels.
- **G-Force Meter action**: Visualizes lateral and longitudinal acceleration with peak G-force tracking.
- **Compass action**: Displays vehicle heading direction with support for Stream Deck + touch display and dial interaction.
- **Power & Torque action**: Displays real-time engine power and torque values.
- **Car Spec action**: Displays vehicle performance index, class (D-X), drivetrain, and cylinder configuration.
- **Forza Series Support**: Support for Forza Horizon and Forza Motorsport (FM7 / FM8) Data Out telemetry streams in Dash format (Sled format is not supported).
- **Stream Deck + Optimized**: Full compatibility with both standard LCD keys and Stream Deck + touch displays / dials.
- **Telemetry Connection Alert**: Visual warning indicator when game telemetry stream is interrupted.

[Unreleased]: https://github.com/shiguruikai/streamdeck-forza-telemetry/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/shiguruikai/streamdeck-forza-telemetry/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/shiguruikai/streamdeck-forza-telemetry/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/shiguruikai/streamdeck-forza-telemetry/compare/v0.1.0...v1.0.0
