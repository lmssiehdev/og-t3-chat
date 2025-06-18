export const modelsInfo: Record<
string, {
	name: string;
	requireApiKey: boolean;
	supportVision?: boolean;
	supportsImageGeneration?: boolean;
	hasDefaultApiKey?: string;
}
> = {
	"fal-ai/flux/dev": {
		name: "Flux",
		supportsImageGeneration: true,
		requireApiKey: false,
	},
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
		supportVision: true,
	},
	"anthropic/claude-sonnet-4": {
		name: "Claude Sonnet 4",
		requireApiKey: true,
		supportVision: false,
	},
};

// duplicated to please zod
export const SUPPORTED_MODELS = [
	"qwen/qwen2.5-vl-32b-instruct",
	"google/gemini-2.5-flash-preview-05-20",
	"openai/gpt-4o-mini",
	"anthropic/claude-sonnet-4",
	"fal-ai/flux/dev",
] as const;

export type AvailableModels = (typeof SUPPORTED_MODELS)[number];
