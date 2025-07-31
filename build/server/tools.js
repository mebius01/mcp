import { z } from "zod";
const formatResponse = (data) => ({
    content: [{
            type: "text",
            text: JSON.stringify(data, null, 2),
            _meta: {},
        }],
});
// Convert JSON Schema properties to Zod schema
const createZodSchema = (properties, required = []) => {
    const shape = {};
    for (const [key, prop] of Object.entries(properties)) {
        let zodType;
        switch (prop.type) {
            case 'string':
                zodType = z.string();
                break;
            case 'number':
                zodType = z.number();
                break;
            case 'boolean':
                zodType = z.boolean();
                break;
            case 'array':
                zodType = z.array(z.any());
                break;
            default:
                zodType = z.any();
        }
        shape[key] = required.includes(key) ? zodType : zodType.optional();
    }
    return shape;
};
// Helper function to create MCP tool with automatic schema conversion
const createMCPTool = (name, description, jsonSchema, callback) => ({
    name,
    description,
    inputSchema: createZodSchema(jsonSchema.properties, jsonSchema.required || []),
    callback
});
// Converted tools ready for MCP server
export const TOOLS = [
    createMCPTool("echo", "Returns the input back as a stringified JSON", {
        properties: {
            message: { type: "string" },
        },
        required: ["message"],
    }, async (args, extra) => {
        const { message } = args;
        return formatResponse({ echo: message });
    }),
    createMCPTool("plus_numbers", "Add two numbers", {
        properties: {
            a: {
                type: "number",
                description: "The first number to add.",
            },
            b: {
                type: "number",
                description: "The second number to add.",
            },
        },
        required: ["a", "b"],
    }, async (args, extra) => {
        const { a, b } = args;
        return formatResponse({ plus_numbers: { a, b, result: a + b } });
    }),
];
