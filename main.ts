import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import WeatherAPI from "weather_api/weather_api";

interface CGDWeatherPluginSettings {
	updateInterval: string;
	latitude: string;
	longitude: string;
}

// 1 hour
const DEFAULT_UPDATE_INTERVAL = "3600";

// Moscow
const DEFAULT_LATITUDE = "55.7522";
const DEFAULT_LONGITUDE = "37.6156";

const DEFAULT_SETTINGS: CGDWeatherPluginSettings = {
	updateInterval: DEFAULT_UPDATE_INTERVAL,
	latitude: DEFAULT_LATITUDE,
	longitude: DEFAULT_LONGITUDE,
};

export default class CGDWeatherPlugin extends Plugin {
	private statusBarEl: HTMLElement;
	private weatherAPi: WeatherAPI;
	private intervalID: number;

	settings: CGDWeatherPluginSettings;

	async onload() {
		await this.loadSettings();

		this.weatherAPi = new WeatherAPI();
		this.statusBarEl = this.addStatusBarItem();

		this.startNewInterval();
		this.updateStatusBar();

		this.addSettingTab(new CGDWeatherPluginSettingTab(this.app, this));
	}

	onunload() {}

	async updateStatusBar() {
		const temperatue = await this.weatherAPi.getCurrent(
			parseFloat(this.settings.latitude),
			parseFloat(this.settings.longitude),
		);

		this.statusBarEl.setText(
			`Current temperature: ${temperatue.toFixed(1)}°C`,
		);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	startNewInterval() {
		if (typeof this.intervalID !== "undefined") {
			window.clearInterval(this.intervalID);
		}

		const settingsUpdateInterval = parseInt(this.settings.updateInterval);
		if (Number.isNaN(settingsUpdateInterval)) {
			return;
		}

		const intervalId = window.setInterval(() => {
			this.updateStatusBar();
		}, settingsUpdateInterval * 1000);

		this.registerInterval(intervalId);
		this.intervalID = intervalId;
	}
}

class CGDWeatherPluginSettingTab extends PluginSettingTab {
	plugin: CGDWeatherPlugin;

	constructor(app: App, plugin: CGDWeatherPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Latitude
		new Setting(containerEl)
			.setName("Latitude")
			.setDesc("Example: 55.7522")
			.addText((text) =>
				text
					.setPlaceholder("Enter latitude (example: 55.7522)")
					.setValue(this.plugin.settings.latitude)
					.onChange(async (value) => {
						this.plugin.settings.latitude = value;
						await this.plugin.saveSettings();
						await this.plugin.updateStatusBar();
					}),
			);

		// Longitude
		new Setting(containerEl)
			.setName("Longitude")
			.setDesc("Example: 37.6156")
			.addText((text) =>
				text
					.setPlaceholder("Enter longitude (example: 37.6156)")
					.setValue(this.plugin.settings.longitude)
					.onChange(async (value) => {
						this.plugin.settings.longitude = value;
						await this.plugin.saveSettings();
						await this.plugin.updateStatusBar();
					}),
			);

		// Update interval
		new Setting(containerEl)
			.setName("Update interval")
			.setDesc("In seconds. Example: 3600 (1 hour)")
			.addText((text) =>
				text
					.setPlaceholder("Enter update interval (example: 3600)")
					.setValue(this.plugin.settings.updateInterval)
					.onChange(async (value) => {
						this.plugin.settings.updateInterval = value;
						this.plugin.startNewInterval();
						await this.plugin.saveSettings();
					}),
			);
	}
}
