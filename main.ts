import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import WeatherAPI from "weather_api/weather_api";

interface CGDWeatherPluginSettings {
	updateInterval: number;
	latitude: string;
	longitude: string;
}

// 1 hour
const DEFAULT_UPDATE_INTERVAL = 3600 * 1000;

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

	settings: CGDWeatherPluginSettings;

	async onload() {
		await this.loadSettings();

		this.weatherAPi = new WeatherAPI();
		this.statusBarEl = this.addStatusBarItem();

		this.registerInterval(
			window.setInterval(() => {
				this.updateStatusBar();
			}, this.settings.updateInterval),
		);

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
		await this.updateStatusBar();
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
					}),
			);

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
					}),
			);
	}
}
