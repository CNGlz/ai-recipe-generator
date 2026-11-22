export function request(ctx) {
  const { ingredients = [] } = ctx.args;

  const prompt = `Suggest a recipe using these ingredients: ${ingredients.join(", ")}. Include a recipe name, ingredients, and step-by-step cooking instructions.`;

  return {
    resourcePath: "/model/us.amazon.nova-micro-v1:0/invoke",
    method: "POST",
    params: {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        schemaVersion: "messages-v1",
        messages: [
          {
            role: "user",
            content: [{ text: prompt }],
          },
        ],
        inferenceConfig: {
          maxTokens: 1000,
        },
      }),
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    return {
      body: null,
      error: ctx.error.message,
    };
  }

  const parsedBody = JSON.parse(ctx.result.body);

  return {
    body: parsedBody.output?.message?.content?.[0]?.text ?? "",
    error: null,
  };
}
