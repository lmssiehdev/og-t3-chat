export const modelsInfo = {
	"google/gemma-3-1b-it:free": {
		name: "Google Gemma 3.1B IT",
		requireApiKey: false,
	},
	"qwen/qwen2.5-vl-3b-instruct:free": {
		name: "Qwen 2.5B VL Instruct",
		requireApiKey: false,
	},
	"openai/gpt-4o-mini": {
		name: "GPT 4o mini",
		requireApiKey: true,
	}
} as const;

export const SUPPORTED_MODELS = ["google/gemma-3-1b-it:free", "qwen/qwen2.5-vl-3b-instruct:free", "openai/gpt-4o-mini"] as const;
export type AvailableModels = typeof SUPPORTED_MODELS[number];