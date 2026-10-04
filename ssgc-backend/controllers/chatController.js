// const { GoogleGenAI, Type } = require('@google/genai');
const Groq = require('groq-sdk');

const {
  getKpisData, getRegionBreakdownData, getTrendData,
  getBillingMetricData, getCustomerClassesData, getGeographyData, getBillingSampleData,
} = require('../services/billingService');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


const filterProperties = {
  
  month: {
    type: 'string',
    description: 'Billing month in YYYYMM format, e.g. 202608'
  },

  unit: {
    type: 'string',
    description: 'Unit code'
  },

  region: {
    type: 'string',
    description: 'Region code'
  },

  zone: {
    type: 'string',
    description: 'Zone code'
  },

  subzone: {
    type: 'string',
    description: 'SubZone code'
  },

  area: {
    type: 'string',
    description: 'Area code'
  },

  mainClass: {
    type: 'string',
    description: 'Main customer class, e.g. Domestic, Commercial, Industrial'
  },

  customerClass: {
    type: 'string',
    description: 'Specific customer class code'
  }
};

const tools = [
  {
  type: 'function',
  function: {
    name: 'get_billing_metric',
    description: 'Get any single billing metric (e.g. gst, arrears, meter_rent, op_bal, levy_charges) aggregated with SUM, AVG, COUNT, MIN, or MAX. Optionally grouped by a dimension. Use this for any numeric question not covered by get_kpis, get_region_breakdown, or get_trend.',
    parameters: {
      type: 'object',
      properties: {
        metric: {
          type: 'string',
          description: 'Column to aggregate, e.g. "gst", "arrears", "meter_rent", "op_bal"',
        },
        aggregation: {
          type: 'string',
          enum: ['SUM', 'AVG', 'COUNT', 'MIN', 'MAX'],
          description: 'How to aggregate the metric, default SUM',
        },
        groupBy: {
          type: 'string',
          enum: ['billing_month', 'region', 'zone', 'subzone', 'area', 'unit', 'mainclass', 'customerclass'],
          description: 'Optional dimension to group results by',
        },
        month: { type: 'string', description: 'Billing month in YYYYMM format' },
        unit: { type: 'string' },
        region: { type: 'string' },
        zone: { type: 'string' },
        subzone: { type: 'string' },
        area: { type: 'string' },
        mainClass: { type: 'string' },
        customerClass: { type: 'string' },
      },
      required: ['metric'],
    },
  },
},
{
  type: 'function',
  function: {
    name: 'list_customer_classes',
    description: 'List all customer classes and which main customer class each belongs to.',
    parameters: { type: 'object', properties: {} },
  },
},
{
  type: 'function',
  function: {
    name: 'list_geography',
    description: 'List distinct values at a given geography level (unit, region, zone, subzone, or area) — useful for answering "what regions exist" type questions.',
    parameters: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          enum: ['unit', 'region', 'zone', 'subzone', 'area'],
          description: 'Which geography level to list, default region',
        },
      },
    },
  },
},
{
  type: 'function',
  function: {
    name: 'sample_billing_records',
    description: 'Get up to 10 actual example billing records, optionally filtered — useful when someone asks to "see" or "show" some real data rather than a total.',
    parameters: {
      type: 'object',
      properties: {
        month: { type: 'string' },
        unit: { type: 'string' },
        region: { type: 'string' },
        zone: { type: 'string' },
        subzone: { type: 'string' },
        area: { type: 'string' },
        mainClass: { type: 'string' },
        customerClass: { type: 'string' },
      },
    },
  },
},
  {
    type: 'function',
    function: {
      name: 'get_kpis',
      description:
        'Get aggregated totals: total consumers, total revenue, gas charges, total records, total SCM, total MMBTU. Optionally filtered by any combination of billing month or geography/customer class.',
      parameters: {
        type: 'object',
        properties: {
          month: {
            type: 'string',
            description:
              'Billing month in YYYYMM format, e.g. 202608',
          },
          unit: {
            type: 'string',
            description: 'Unit code',
          },
          region: {
            type: 'string',
            description: 'Region code',
          },
          zone: {
            type: 'string',
            description: 'Zone code',
          },
          subzone: {
            type: 'string',
            description: 'SubZone code',
          },
          area: {
            type: 'string',
            description: 'Area code',
          },
          mainClass: {
            type: 'string',
            description:
              'Main customer class, e.g. Domestic, Commercial, Industrial',
          },
          customerClass: {
            type: 'string',
            description: 'Specific customer class code',
          },
        },
      },
    },
  },

  {
    type: 'function',
    function: {
      name: 'get_region_breakdown',
      description:
        'Get gas charges broken down by region, optionally filtered by billing month or customer class.',
      parameters: {
        type: 'object',
        properties: {
          month: {
            type: 'string',
            description:
              'Billing month in YYYYMM format, e.g. 202608',
          },
          unit: {
            type: 'string',
            description: 'Unit code',
          },
          region: {
            type: 'string',
            description: 'Region code',
          },
          zone: {
            type: 'string',
            description: 'Zone code',
          },
          subzone: {
            type: 'string',
            description: 'SubZone code',
          },
          area: {
            type: 'string',
            description: 'Area code',
          },
          mainClass: {
            type: 'string',
            description: 'Main customer class',
          },
          customerClass: {
            type: 'string',
            description: 'Specific customer class code',
          },
        },
      },
    },
  },

  {
    type: 'function',
    function: {
      name: 'get_trend',
      description:
        'Get gas charges and payment amounts across the last N billing months, for spotting trends over time.',
      parameters: {
        type: 'object',
        properties: {
          month: {
            type: 'string',
            description:
              'Billing month in YYYYMM format, e.g. 202608',
          },
          unit: {
            type: 'string',
            description: 'Unit code',
          },
          region: {
            type: 'string',
            description: 'Region code',
          },
          zone: {
            type: 'string',
            description: 'Zone code',
          },
          subzone: {
            type: 'string',
            description: 'SubZone code',
          },
          area: {
            type: 'string',
            description: 'Area code',
          },
          mainClass: {
            type: 'string',
            description: 'Main customer class',
          },
          customerClass: {
            type: 'string',
            description: 'Specific customer class code',
          },
          months: {
            type: 'number',
            description:
              'How many recent months to include, default 12',
          },
        },
      },
    },
  },
];


async function executeTool(name, args) {
  switch (name) {
    case 'get_kpis':
      return await getKpisData(args);
    case 'get_region_breakdown':
      return await getRegionBreakdownData(args);
    case 'get_trend':
      return await getTrendData(args, args.months || 12);
    case 'get_billing_metric':
      return await getBillingMetricData(args);
    case 'list_customer_classes':
      return await getCustomerClassesData();
    case 'list_geography':
      return await getGeographyData(args.level);
    case 'sample_billing_records':
      return await getBillingSampleData(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// async function chat(req, res) {
//   const { message, history = [] } = req.body;

//   if (!message) {
//     return res.status(400).json({ error: 'message is required' });
//   }

//   try {
//     // Prior turns first, then the new message — this is what gives
//     // Gemini memory of the conversation so far.
//     let contents = [
//       ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
//       { role: 'user', parts: [{ text: message }] },
//     ];

//     let finalText = '';

//     for (let iteration = 0; iteration < 5; iteration++) {
//       const response = await ai.models.generateContent({
//         model: 'gemini-3.6-flash',
//         contents,
//         config: { tools },
//       });

//       const functionCalls = response.functionCalls;

//       if (!functionCalls || functionCalls.length === 0) {
//         finalText = response.text;
//         break;
//       }

//       const functionResponseParts = [];
//       for (const call of functionCalls) {
//         let result;
//         try {
//           result = await executeTool(call.name, call.args || {});
//         } catch (err) {
//           result = { error: err.message };
//         }
//         functionResponseParts.push({
//           functionResponse: { name: call.name, response: { result } },
//         });
//       }

//       contents.push(response.candidates[0].content);
//       contents.push({ role: 'user', parts: functionResponseParts });
//     }

//     res.json({ reply: finalText || "I wasn't able to find an answer to that." });
//   } catch (err) {
//     console.error('chat error:', err);
//     if (err.status === 429) {
//       return res.status(503).json({
//         error: 'The AI assistant has reached its Gemini API quota. Please try again later or check your Gemini billing plan.',
//       });
//     }
//     res.status(500).json({ error: 'Failed to get a response from the assistant' });
//   }
// }
async function chat(req, res) {
  const { message, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({
      error: 'message is required',
    });
  }

  try {
    const messages = [
       {
    role: 'system',
    content: `
You are a billing data assistant for SSGC.

IMPORTANT CURRENCY RULE:
- All monetary amounts in the database are in Pakistani Rupees (PKR).
- NEVER use the Nigerian Naira symbol (₦).
- NEVER use Nigerian Naira (NGN).
- When displaying monetary amounts, ALWAYS use "Rs" before the amount.
- Example: 70167557 must be displayed as Rs 70,167,557.
- Do not convert the amount to another currency.
- Non-monetary values such as consumers, SCM, MMBTU, and counts must NOT have Rs.
`
  },
  ...history.map((turn) => ({
    role: turn.role === 'model' ? 'assistant' : turn.role,
    content: turn.text
  })),
  { role: 'user', content: message }
];

    let finalText = '';

    for (let iteration = 0; iteration < 5; iteration++) {
      const response = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages,
        tools,
        tool_choice: 'auto',
      });

      const assistantMessage = response.choices[0].message;

      messages.push(assistantMessage);

      if (
        !assistantMessage.tool_calls ||
        assistantMessage.tool_calls.length === 0
      ) {
finalText = assistantMessage.content
  .replace(/₦/g, 'Rs ')
  .trim();        break;
      }

      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;

        let args;

        try {
          args = JSON.parse(toolCall.function.arguments || '{}');
        } catch (err) {
          args = {};
        }

        let result;

        try {
          result = await executeTool(functionName, args);
        } catch (err) {
          result = {
            error: err.message,
          };
        }

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }

    res.json({
      reply:
        finalText ||
        "I wasn't able to find an answer to that.",
    });
  } catch (err) {
    console.error('Groq chat error:', err);

    if (err.status === 429) {
      return res.status(503).json({
        error:
          'The AI assistant has reached its Groq API rate limit. Please try again later.',
      });
    }

    res.status(500).json({
      error: 'Failed to get a response from the assistant',
    });
  }
}

const fs = require('fs');
const os = require('os');
const path = require('path');

async function transcribe(req, res) {
  const {
    audio,
    mimeType = 'audio/m4a',
  } = req.body;

  if (!audio) {
    return res.status(400).json({
      error: 'audio is required',
    });
  }

  const extension =
    mimeType === 'audio/m4a' ? '.m4a' : '.audio';

  const tempPath = path.join(
    os.tmpdir(),
    `audio-${Date.now()}${extension}`
  );

  try {
    const audioBuffer = Buffer.from(audio, 'base64');

    fs.writeFileSync(tempPath, audioBuffer);

    const transcription =
      await groq.audio.transcriptions.create({
        file: fs.createReadStream(tempPath),
        model: 'whisper-large-v3-turbo',
        response_format: 'json',
      });

    res.json({
      transcript: transcription.text.trim(),
    });
  } catch (err) {
    console.error('Groq transcription error:', err);

    if (err.status === 429) {
      return res.status(503).json({
        error:
          'The AI assistant has reached its Groq API rate limit.',
      });
    }

    res.status(500).json({
      error: 'Failed to transcribe audio',
    });
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
}

module.exports = { chat, transcribe };