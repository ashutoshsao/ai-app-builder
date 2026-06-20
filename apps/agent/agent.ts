import { GoogleGenAI } from "@google/genai";
import { Type } from "@google/genai";
import { promisify } from "node:util";
import { exec } from "node:child_process";
const ai = new GoogleGenAI({ apiKey: process.env.gemini_api_key });
const execAsync = promisify(exec);

//tool definition
const bashFunction = {
  name: "run_bash_command",
  description: "Runs a bash command and returns its output. Use for: listing files, checking directories, running scripts.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      command: {
        type: Type.STRING,
        description: "The bash command to run, e.g. ls -la",
      },
    },
    required: ["command"],
  },
};

//tool ececution
async function executeTool(name: string, args: Record<string, string>): Promise<string> {
  if (name === "run_bash_command") {
    try {
      console.log(`  [bash] $ ${args.command}`)
      const { stdout, stderr } = await execAsync(args.command!, {
        encoding: "utf-8",
        timeout: 10_000,
      });

      return stdout || stderr || "no output";
    } catch (err) {
      return `Error: ${(err as Error).message}`;
    }
  }
  return `Unknown tool ${name}`;
}

export async function runAgentLoop(userPrompt: string) {

  const contents: any[] = [
    { role: "user", parts: [{ text: userPrompt }] }
  ]

  const max_iters = 10;

  for (let i = 0; i < max_iters; i++) {
    console.log(`iteration no ${i}`);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        tools: [{ functionDeclarations: [bashFunction] }],
        systemInstruction: "You are a helpful assistant. Use tools when needed. When you have the answer, respond in plain text.",
      }
    })

    const functionCalls = response.functionCalls;

    if (!functionCalls || functionCalls.length === 0) {
      console.log(`Final answer ${response.text}`);
      return;
    }

    //add model response to the history
    console.log(JSON.stringify(response));
    contents.push(response.candidates![0]!.content);
    //execute tools
    const toolResultParts = await Promise.all(
      functionCalls.map(async fc => {
        const result = await executeTool(fc.name!, fc.args as Record<string, string>);

        console.log(`Result:${result.slice(0, 120)}${result.length > 120 ? "..." : ""}`);

        return {
          functionResponse: {
            name: fc.name!,
            id: fc.id,
            response: { output: result },
          },
        };
      })
    );

    //add tool execution result to history
    contents.push({
      role: "user",
      parts: toolResultParts
    });

    //loop continues with next set of instruction until no fucntionCalls left
  }
  console.log("Max steps reached");
}
