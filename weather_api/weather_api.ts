import { fetchWeatherApi } from "openmeteo";

export default class WeatherAPI {
	constructor() {}

	async getCurrent(latitube: number, longitude: number) {
		const params = {
			latitude: latitube,
			longitude: longitude,
			current: "temperature_2m",
		};

		const url = "https://api.open-meteo.com/v1/forecast";
		const responses = await fetchWeatherApi(url, params);

		const response = responses[0];
		const current = response.current()!;

		// todo: handle case when response is nil

		return current.variables(0)!.value();
	}
}
