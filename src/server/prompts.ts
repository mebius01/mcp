import { ServerNotification, ServerRequest, GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { IMCPPrompt } from "../interface.js";
import { createZodSchema } from "./utils.js";

export const PROMPTS: IMCPPrompt[] = [
  {
    name: "code-review",
    description: "Generate a comprehensive code review prompt with specific focus areas",
    argsSchema: createZodSchema(
      {
        language: {
          type: 'string',
          description: 'Programming language (e.g., typescript, python, javascript)'
        },
        focus: {
          type: 'string',
          description: 'Review focus: security, performance, readability, architecture, or all'
        },
        complexity: {
          type: 'string',
          description: 'Code complexity level: beginner, intermediate, advanced'
        }
      },
      ['language', 'focus']
    ),
    callback: async (args: { language: string; focus: string; complexity?: string; }) => {
      const complexity = args.complexity || 'intermediate';

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Please review the following ${args.language} code with focus on ${args.focus}. 
              Consider this is ${complexity} level code. Provide:
              1. Overall assessment
              2. Specific issues found
              3. Improvement suggestions
              4. Best practices recommendations
              
              Please be thorough but constructive in your feedback.`
            }
          }
        ]
      };
    }
  },
  {
    name: "explain-concept",
    description: "Generate an educational explanation prompt for technical concepts",
    argsSchema: createZodSchema(
      {
        concept: {
          type: 'string',
          description: 'Technical concept to explain (e.g., "async/await", "MCP protocol", "microservices")'
        },
        audience: {
          type: 'string',
          description: 'Target audience: beginner, developer, architect, or student'
        },
        format: {
          type: 'string',
          description: 'Explanation format: tutorial, overview, deep-dive, or practical'
        },
        examples: {
          type: 'boolean',
          description: 'Include practical examples and code samples'
        }
      },
      ['concept', 'audience']
    ),
    callback: async (args: { concept: string; audience: string; format?: string; examples?: boolean; }) => {
      const format = args.format || 'overview';
      const includeExamples = args.examples ? 'with practical examples and code samples' : 'with theoretical explanations';

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Please explain "${args.concept}" for ${args.audience} level audience in ${format} format ${includeExamples}.
              
              Structure your explanation with:
              1. Clear definition
              2. Why it matters
              3. How it works
              4. Common use cases
              ${args.examples ? '5. Practical examples with code\n6. Common pitfalls to avoid' : '5. Key takeaways'}
              
              Make it engaging and easy to understand!`
            }
          }
        ]
      };
    }
  },
  {
    name: "debug-helper",
    description: "Generate a debugging strategy prompt for troubleshooting issues",
    argsSchema: createZodSchema(
      {
        problem_type: {
          type: 'string',
          description: 'Type of problem: performance, error, integration, logic, or deployment'
        },
        technology: {
          type: 'string',
          description: 'Technology stack (e.g., "Node.js + TypeScript", "React", "MCP Server")'
        },
        urgency: {
          type: 'string',
          description: 'Issue urgency: low, medium, high, critical'
        }
      },
      ['problem_type', 'technology']
    ),
    callback: async (args: { problem_type: string; technology: string; urgency?: string; }) => {
      const urgency = args.urgency || 'medium';

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Help me debug a ${args.problem_type} issue in ${args.technology} (${urgency} priority).
              
              Please provide a systematic debugging approach:
              1. Initial assessment questions
              2. Step-by-step investigation process
              3. Common causes for this type of issue
              4. Debugging tools and techniques
              5. Prevention strategies
              
              Focus on practical, actionable steps I can take right now.`
            }
          }
        ]
      };
    }
  },
  {
    name: "architecture-design",
    description: "Generate an architecture design discussion prompt",
    argsSchema: createZodSchema(
      {
        system_type: {
          type: 'string',
          description: 'Type of system: web-app, api, microservices, desktop-app, or mobile-app'
        },
        scale: {
          type: 'string',
          description: 'Expected scale: small, medium, large, enterprise'
        },
        constraints: {
          type: 'string',
          description: 'Key constraints or requirements (e.g., "real-time", "high-availability", "budget-limited")'
        }
      },
      ['system_type', 'scale']
    ),
    callback: async (args: { system_type: string; scale: string; constraints?: string; }) => {
      const constraints = args.constraints ? ` with constraints: ${args.constraints}` : '';

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Let's design the architecture for a ${args.scale} scale ${args.system_type}${constraints}.
              
              Please help me think through:
              1. High-level architecture overview
              2. Technology stack recommendations
              3. Key architectural patterns to consider
              4. Scalability considerations
              5. Security considerations
              6. Deployment strategy
              7. Monitoring and observability
              
              Provide reasoning for your recommendations and alternative approaches.`
            }
          }
        ]
      };
    }
  }
];