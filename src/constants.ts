export const modelsInfo = {
	"qwen/qwen2.5-vl-32b-instruct": {
		name: "Qwen 2.5 vl",
		requireApiKey: false,
		supportVision: true,
	},
	"google/gemini-2.5-flash-preview-05-20": {
		name: "Gemini 2.5 Flash Preview",
		requireApiKey: false,
		supportVision: true,
	},
	"openai/gpt-4o-mini": {
		name: "GPT 4o mini",
		requireApiKey: true,
		supportVision: false,
	},
	"anthropic/claude-sonnet-4": {
		name: "Claude Sonnet 4",
		requireApiKey: true,
		supportVision: false,
	},
} as const;

// duplicated to please zod
export const SUPPORTED_MODELS = [
	"qwen/qwen2.5-vl-32b-instruct",
	"google/gemini-2.5-flash-preview-05-20",
	"openai/gpt-4o-mini",
	"anthropic/claude-sonnet-4",
] as const;

export type AvailableModels = (typeof SUPPORTED_MODELS)[number];
