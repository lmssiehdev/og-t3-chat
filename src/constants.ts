export const modelsInfo = {
	"deepseek/deepseek-r1-0528-qwen3-8b:free": {
		name: "Deepseek R1 0528 Qwen 3.8B",
		requireApiKey: false,
		supportVision: false,
	},
	"openai/gpt-4o-mini": {
		name: "GPT 4o mini",
		requireApiKey: true,
		supportVision: false,
	},
	"google/gemini-2.5-flash-preview-05-20": {
		name: "Gemini 2.5 Flash Preview 05-20",
		requireApiKey: true,
		supportVision: true,
	},
} as const;

// duplicated to please zod
export const SUPPORTED_MODELS = [
	"deepseek/deepseek-r1-0528-qwen3-8b:free",
	"openai/gpt-4o-mini",
	"google/gemini-2.5-flash-preview-05-20",
] as const;

export type AvailableModels = (typeof SUPPORTED_MODELS)[number];
