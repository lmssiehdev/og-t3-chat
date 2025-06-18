export const modelsInfo = {
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
	"anthropic/claude-sonnet-4",
	"openai/gpt-4o-mini",
	"google/gemini-2.5-flash-preview-05-20",
] as const;

export type AvailableModels = (typeof SUPPORTED_MODELS)[number];
