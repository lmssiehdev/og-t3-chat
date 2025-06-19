export const modelsInfo: Record<
	string,
	{
		name: string;
		description: string;
		requireApiKey: boolean;
		supportVision?: boolean;
		supportsImageGeneration?: boolean;
		hasDefaultApiKey?: string;
		supportFileUpload: boolean;
		supportsWebSearch?: boolean;
	}
> = {
	"fal-ai/flux/dev": {
		name: "Flux",
		description: "flux here for some lovely art",
		supportsImageGeneration: true,
		requireApiKey: false,
		supportFileUpload: false,
		supportVision: false,
	},
	"qwen/qwen2.5-vl-32b-instruct": {
		name: "Qwen 2.5 vl",
		description: "Open-weight model from Alibaba",
		requireApiKey: false,
		supportVision: true,
		supportFileUpload: false,
	},
	"google/gemini-2.5-flash-preview-05-20": {
		name: "Gemini 2.5 Flash Preview",
		description: "Google's state of the art fast model",
		requireApiKey: false,
		supportVision: true,
		supportFileUpload: true,
		supportsImageGeneration: false,
	},
	"perplexity/sonar:online": {
		name: "Perplexity (web)",
		description: "OpenAI's flagship; versatile and intelligent",
		requireApiKey: true,
		supportVision: true,
		supportFileUpload: false,
		supportsWebSearch: true,
	},
	"openai/gpt-4o-mini": {
		name: "GPT 4o mini",
		description: "OpenAI's latest small reasoning model",
		requireApiKey: true,
		supportVision: true,
		supportFileUpload: true,
	},
	"anthropic/claude-sonnet-4": {
		name: "Claude Sonnet 4",
		description: "Anthropic's flagship model",
		requireApiKey: true,
		supportVision: false,
		supportFileUpload: true,
	},
};

// duplicated to please zod
export const SUPPORTED_MODELS = [
	"qwen/qwen2.5-vl-32b-instruct",
	"google/gemini-2.5-flash-preview-05-20",
	"perplexity/sonar:online",
	"openai/gpt-4o-mini",
	"anthropic/claude-sonnet-4",
	"fal-ai/flux/dev",
] as const;

export type AvailableModels = (typeof SUPPORTED_MODELS)[number];
