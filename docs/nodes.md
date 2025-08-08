# n8n Nodes Configuration Reference

This document contains comprehensive information about all n8n nodes, their configurations, and usage examples for the AgentX Vibe Coding project.

## Table of Contents

1. [Trigger Nodes](#trigger-nodes)
2. [Core Nodes](#core-nodes)
3. [Logic & Control Nodes](#logic--control-nodes)
4. [Data Processing Nodes](#data-processing-nodes)
5. [AI & LangChain Nodes](#ai--langchain-nodes)
6. [App Integration Nodes](#app-integration-nodes)
7. [Database Nodes](#database-nodes)
8. [Communication Nodes](#communication-nodes)
9. [File & Storage Nodes](#file--storage-nodes)
10. [Development & DevOps Nodes](#development--devops-nodes)

---

## Trigger Nodes

### Activation Trigger
**Category:** Trigger  
**Description:** Triggers the workflow when it is first activated. This node runs once at workflow activation, allowing you to set up initial states or run startup logic for your workflow.

```json
{
  "parameters": {},
  "name": "Activation Trigger",
  "type": "n8n-nodes-base.activationTrigger",
  "typeVersion": 1,
  "position": [500, 300]
}
```

### Chat Trigger
**Category:** Trigger  
**Description:** Starts the workflow in response to incoming chat messages via n8n's internal chat interface (such as from the n8n Chat app). It allows you to trigger workflows when a user sends a message in the integrated chat, enabling chat-driven automation.

```json
{
  "parameters": {
    "options": {}
  },
  "name": "Chat Trigger",
  "type": "n8n-nodes-langchain.chatTrigger",
  "typeVersion": 1,
  "position": [400, 300]
}
```

### Email Trigger (IMAP)
**Category:** Trigger  
**Description:** Monitors an IMAP email inbox and triggers the workflow when new emails arrive. Use the IMAP Email node to receive emails using an IMAP server – this node is a trigger node that starts workflows on incoming mail.

```json
{
  "parameters": {
    "triggerOn": "newEmail",
    "server": "imap.gmail.com",
    "port": 993,
    "secure": true,
    "mailbox": "INBOX",
    "options": {}
  },
  "name": "Email Trigger (IMAP)",
  "type": "n8n-nodes-base.emailImap",
  "typeVersion": 2,
  "position": [400, 150]
}
```

### Error Trigger
**Category:** Trigger  
**Description:** Starts the workflow when any other node in the workflow fails (throws an error). This is useful for global error handling – the Error Trigger will catch errors from any node in the parent workflow and execute its connected error-handling workflow.

```json
{
  "parameters": {},
  "name": "Error Trigger",
  "type": "n8n-nodes-base.errorTrigger",
  "typeVersion": 1,
  "position": [400, 450]
}
```

### Evaluation Trigger
**Category:** Trigger  
**Description:** Triggers an evaluation run of a workflow (used in n8n's AI workflow evaluation framework). It starts the workflow in evaluation mode, allowing you to test and score the workflow's AI-driven results for comparison to expected outcomes.

```json
{
  "parameters": {},
  "name": "Evaluation Trigger",
  "type": "n8n-nodes-base.evaluationTrigger",
  "typeVersion": 1,
  "position": [400, 250]
}
```

### Execute Sub-workflow Trigger
**Category:** Trigger  
**Description:** Serves as an entry point for workflows started via the Execute Sub-workflow node. When a parent workflow uses an Execute Sub-workflow node to call another workflow, this trigger in the called workflow catches that invocation and starts the execution.

```json
{
  "parameters": {},
  "name": "Execute Sub-workflow Trigger",
  "type": "n8n-nodes-base.executeWorkflowTrigger",
  "typeVersion": 1,
  "position": [420, 300]
}
```

### Local File Trigger
**Category:** Trigger  
**Description:** Watches a local filesystem path for new or modified files and triggers the workflow when a change is detected. You can configure the directory and file pattern to monitor, enabling file-based workflow kicks-offs on your n8n host machine.

```json
{
  "parameters": {
    "path": "/data/watch_folder",
    "watchFor": "file",
    "options": {
      "pollingInterval": 60
    }
  },
  "name": "Local File Trigger",
  "type": "n8n-nodes-base.localFileTrigger",
  "typeVersion": 1,
  "position": [400, 200]
}
```

### Manual Trigger
**Category:** Trigger  
**Description:** A trigger node that is manually activated (e.g. by clicking "Execute Workflow"). It doesn't wait for an external event – instead, it allows you to start the workflow on demand during development or testing. This is useful as a placeholder trigger for manually running workflows.

```json
{
  "parameters": {},
  "name": "Manual Trigger",
  "type": "n8n-nodes-base.manualTrigger",
  "typeVersion": 1,
  "position": [250, 300]
}
```

### MCP Server Trigger
**Category:** Trigger  
**Description:** Listens for events from n8n's internal MCP server (Message Channel Protocol server) and triggers the workflow when such events occur. It's used for advanced or experimental internal events in n8n's multi-process or cluster setup, allowing workflows to react to internal system broadcasts.

```json
{
  "parameters": {},
  "name": "MCP Server Trigger",
  "type": "n8n-nodes-langchain.mcpTrigger",
  "typeVersion": 1,
  "position": [400, 350]
}
```

### n8n Form Trigger
**Category:** Trigger  
**Description:** Starts the workflow when an n8n workflow form is submitted. This works in tandem with the n8n Form node – the form trigger waits for a user to submit input via an n8n-generated form, then the trigger fires to feed that input into the workflow (useful for human-in-the-loop workflows).

```json
{
  "parameters": {
    "formTitle": "Contact Form",
    "formDescription": "Please fill out this form",
    "formFields": {
      "values": [
        {
          "fieldLabel": "Name",
          "fieldType": "text",
          "requiredField": true
        },
        {
          "fieldLabel": "Email",
          "fieldType": "email",
          "requiredField": true
        }
      ]
    }
  },
  "name": "n8n Form Trigger",
  "type": "n8n-nodes-base.formTrigger",
  "typeVersion": 2,
  "position": [350, 300]
}
```

### n8n Trigger
**Category:** Trigger  
**Description:** Triggers when the n8n instance or the workflow itself undergoes certain lifecycle events. The n8n Trigger node can start a workflow when the current workflow is updated, activated, or when the n8n instance starts/restarts. It is often used to notify or perform setup tasks on these events.

```json
{
  "parameters": {
    "events": [
      "workflowActivated",
      "workflowUpdated",
      "instanceStarted"
    ]
  },
  "name": "n8n Trigger",
  "type": "n8n-nodes-base.n8nTrigger",
  "typeVersion": 1,
  "position": [250, 150]
}
```

### RSS Feed Trigger
**Category:** Trigger  
**Description:** Monitors an RSS/Atom feed for new items and triggers the workflow when a new feed entry is detected. You can configure the feed URL and polling interval – when a new article or entry appears in the feed (since the last check), the node will emit that item to start the workflow.

```json
{
  "parameters": {
    "feedUrl": "https://example.com/blog/rss.xml",
    "pollTimes": {
      "item": [
        {
          "mode": "everyMinute"
        }
      ]
    }
  },
  "name": "RSS Feed Trigger",
  "type": "n8n-nodes-base.rssFeedReadTrigger",
  "typeVersion": 1,
  "position": [420, 150]
}
```

### Schedule Trigger
**Category:** Trigger  
**Description:** Triggers the workflow on a scheduled basis (cron). You can configure it to run periodically (e.g. every X minutes/hours) or at specific times using a cron expression. For example, it can run a workflow every day at midnight or every 5 minutes, enabling time-based automations.

```json
{
  "parameters": {
    "rule": {
      "interval": [
        {
          "field": "cronExpression",
          "expression": "0 0 * * *"
        }
      ]
    }
  },
  "name": "Schedule Trigger",
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2,
  "position": [250, 450]
}
```

### SSE Trigger
**Category:** Trigger  
**Description:** Listens to a Server-Sent Events (SSE) stream via HTTP and triggers the workflow for each event received. You provide a URL that emits SSE (text/event-stream) – the node will maintain an open connection and start the workflow whenever an event message is pushed by the server. This enables near-real-time triggers from SSE sources.

```json
{
  "parameters": {
    "url": "https://example.com/events/stream",
    "options": {}
  },
  "name": "SSE Trigger",
  "type": "n8n-nodes-base.sseTrigger",
  "typeVersion": 1,
  "position": [500, 150]
}
```

### Webhook
**Category:** Trigger  
**Description:** Creates an HTTP endpoint (URL) that can receive incoming HTTP requests to start a workflow. The Webhook node can receive data from apps/services when an event occurs (via HTTP POST, GET, etc.) and is commonly used to trigger workflows in real-time from external systems. (It supports various HTTP methods, authentication, and can respond synchronously or asynchronously.)

```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "webhook-path",
    "options": {}
  },
  "name": "Webhook",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "position": [200, 300]
}
```

### Workflow Trigger
**Category:** Trigger  
**Description:** Triggers the workflow when it is executed by another workflow via the Execute Workflow node. In a sub-workflow, adding a Workflow Trigger node allows that sub-workflow to start only when called from a parent workflow (it listens for the call event). This ensures the sub-workflow doesn't run on its own, only as triggered by another.

```json
{
  "parameters": {},
  "name": "Workflow Trigger",
  "type": "n8n-nodes-base.workflowTrigger",
  "typeVersion": 1,
  "position": [220, 350]
}
```

---

## Core Nodes

### Code
**Category:** Core  
**Description:** Allows you to write custom JavaScript or Python code to process data. The Code node provides full programming capabilities within your workflow, enabling complex data transformations, API calls, and custom logic that isn't available in other nodes.

```json
{
  "parameters": {
    "language": "javaScript",
    "jsCode": "// Process each input item\nfor (const item of $input.all()) {\n  item.json.processed = true;\n  item.json.timestamp = new Date().toISOString();\n}\n\nreturn $input.all();"
  },
  "name": "Code",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [400, 300]
}
```

### HTTP Request
**Category:** Core  
**Description:** Makes HTTP requests to external APIs and services. This is one of the most versatile nodes in n8n, allowing you to interact with any REST API, send data to webhooks, or fetch information from web services.

```json
{
  "parameters": {
    "method": "GET",
    "url": "https://api.example.com/data",
    "options": {
      "headers": {
        "Authorization": "Bearer {{$credentials.apiToken}}"
      }
    }
  },
  "name": "HTTP Request",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [600, 300]
}
```

### Edit Fields (Set)
**Category:** Core  
**Description:** Modifies, adds, or removes fields from the input data. The Set node is essential for data transformation, allowing you to restructure data, add computed fields, or prepare data for the next node in your workflow.

```json
{
  "parameters": {
    "assignments": {
      "assignments": [
        {
          "id": "field1",
          "name": "fullName",
          "value": "={{$json.firstName}} {{$json.lastName}}",
          "type": "string"
        },
        {
          "id": "field2",
          "name": "processedAt",
          "value": "={{new Date().toISOString()}}",
          "type": "string"
        }
      ]
    },
    "options": {}
  },
  "name": "Edit Fields (Set)",
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4,
  "position": [800, 300]
}
```

### Execute Command
**Category:** Core  
**Description:** Executes shell commands on the n8n host system. This node allows you to run system commands, scripts, or interact with command-line tools as part of your workflow.

```json
{
  "parameters": {
    "command": "ls -la /tmp",
    "options": {}
  },
  "name": "Execute Command",
  "type": "n8n-nodes-base.executeCommand",
  "typeVersion": 1,
  "position": [400, 500]
}
```

### Read/Write Files from Disk
**Category:** Core  
**Description:** Reads from or writes to files on the local filesystem. This node enables file operations within workflows, allowing you to process local files, save workflow results, or manage file-based data.

```json
{
  "parameters": {
    "operation": "read",
    "filePath": "/data/input.txt",
    "options": {}
  },
  "name": "Read/Write Files from Disk",
  "type": "n8n-nodes-base.readWriteFile",
  "typeVersion": 1,
  "position": [200, 500]
}
```

---

## Logic & Control Nodes

### If
**Category:** Logic & Control  
**Description:** Splits the workflow based on a condition, allowing branching logic. The If node evaluates specified conditions for each input item and directs items to either the true branch (if conditions are met) or the false branch (if not).

```json
{
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": true,
        "leftValue": "",
        "typeValidation": "strict"
      },
      "conditions": [
        {
          "id": "condition1",
          "leftValue": "={{$json.status}}",
          "rightValue": "approved",
          "operator": {
            "type": "string",
            "operation": "equals"
          }
        }
      ],
      "combinator": "and"
    }
  },
  "name": "If",
  "type": "n8n-nodes-base.if",
  "typeVersion": 2,
  "position": [300, 200]
}
```

### Switch
**Category:** Logic & Control  
**Description:** Routes items to different branches depending on the value of a specified field (or expression). The Switch node is like a multi-condition if/else: you choose a field (or variable) to compare and define multiple cases.

```json
{
  "parameters": {
    "dataType": "string",
    "value1": "={{$json.status}}",
    "rules": {
      "rules": [
        {
          "value2": "open",
          "output": 0
        },
        {
          "value2": "closed",
          "output": 1
        },
        {
          "value2": "pending",
          "output": 2
        }
      ]
    }
  },
  "name": "Switch",
  "type": "n8n-nodes-base.switch",
  "typeVersion": 3,
  "position": [450, 200]
}
```

### Merge
**Category:** Logic & Control  
**Description:** Merges two data streams in a workflow. The Merge node can combine items from two input branches either by position (pairing the first item of each, second of each, etc.), by key (matching items with the same key value), or by simply concatenating the inputs.

```json
{
  "parameters": {
    "mode": "append",
    "options": {}
  },
  "name": "Merge",
  "type": "n8n-nodes-base.merge",
  "typeVersion": 3,
  "position": [600, 200]
}
```

### No Operation, do nothing
**Category:** Logic & Control  
**Description:** Does nothing and simply passes through its input. This node is used as a placeholder or to improve workflow readability, marking a point where data flow stops or no action is taken.

```json
{
  "parameters": {},
  "name": "No Operation",
  "type": "n8n-nodes-base.noOp",
  "typeVersion": 1,
  "position": [600, 350]
}
```

### Stop And Error
**Category:** Logic & Control  
**Description:** Intentionally stops the workflow execution and flags it as failed. When this node runs, it will throw an error (with a custom message if provided), causing the workflow to terminate at that point.

```json
{
  "parameters": {
    "message": "Stopping execution due to invalid data."
  },
  "name": "Stop And Error",
  "type": "n8n-nodes-base.stopAndError",
  "typeVersion": 1,
  "position": [750, 350]
}
```

### Wait
**Category:** Logic & Control  
**Description:** Pauses the workflow for a specified duration or until a certain time. The Wait node allows you to delay execution – for example, "wait 5 minutes" or "wait until 9:00 AM tomorrow" – before continuing to the next node.

```json
{
  "parameters": {
    "resume": "timeInterval",
    "amount": 5,
    "unit": "minutes"
  },
  "name": "Wait",
  "type": "n8n-nodes-base.wait",
  "typeVersion": 1.1,
  "position": [750, 200]
}
```

### Limit
**Category:** Logic & Control  
**Description:** Limits the number of items that pass through. You can configure a max count of items to output and optionally skip a certain number of initial items.

```json
{
  "parameters": {
    "maxItems": 100,
    "keep": "firstItems"
  },
  "name": "Limit",
  "type": "n8n-nodes-base.limit",
  "typeVersion": 1,
  "position": [750, 100]
}
```

### Loop Over Items (Split in Batches)
**Category:** Logic & Control  
**Description:** Enables looping through a list of items by processing them in smaller batches. The Loop Over Items node takes an incoming list and emits a specified number of items at a time, then pauses until signaled to continue.

```json
{
  "parameters": {
    "batchSize": 10,
    "options": {}
  },
  "name": "Loop Over Items",
  "type": "n8n-nodes-base.splitInBatches",
  "typeVersion": 3,
  "position": [900, 200]
}
```

### Execute Sub-workflow
**Category:** Logic & Control  
**Description:** Calls another workflow (sub-workflow) from the current workflow. The Execute Sub-workflow node allows you to break complex processes into reusable workflows – it triggers the specified workflow and waits for it to finish, then returns its output back to the main workflow.

```json
{
  "parameters": {
    "source": "database",
    "workflowId": "123",
    "options": {}
  },
  "name": "Execute Sub-workflow",
  "type": "n8n-nodes-base.executeWorkflow",
  "typeVersion": 1,
  "position": [400, 600]
}
```

---

## Data Processing Nodes

### Filter
**Category:** Data Processing  
**Description:** Filters items based on specified conditions. Only items that match the filter criteria will pass through to the next node, while non-matching items are discarded.

```json
{
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": true,
        "leftValue": "",
        "typeValidation": "strict"
      },
      "conditions": [
        {
          "id": "condition1",
          "leftValue": "={{$json.age}}",
          "rightValue": 18,
          "operator": {
            "type": "number",
            "operation": "gte"
          }
        }
      ],
      "combinator": "and"
    }
  },
  "name": "Filter",
  "type": "n8n-nodes-base.filter",
  "typeVersion": 2,
  "position": [400, 400]
}
```

### Sort
**Category:** Data Processing  
**Description:** Sorts items based on specified field values. You can sort by multiple fields and specify ascending or descending order for each field.

```json
{
  "parameters": {
    "sortFieldsUi": {
      "sortField": [
        {
          "fieldName": "createdAt",
          "order": "descending"
        },
        {
          "fieldName": "name",
          "order": "ascending"
        }
      ]
    }
  },
  "name": "Sort",
  "type": "n8n-nodes-base.sort",
  "typeVersion": 1,
  "position": [600, 400]
}
```

### Remove Duplicates
**Category:** Data Processing  
**Description:** Removes duplicate items from the input data based on specified comparison fields. This node helps clean datasets by eliminating redundant entries.

```json
{
  "parameters": {
    "compare": "selectedFields",
    "fieldsToCompare": {
      "fields": [
        {
          "fieldName": "email"
        },
        {
          "fieldName": "userId"
        }
      ]
    }
  },
  "name": "Remove Duplicates",
  "type": "n8n-nodes-base.removeDuplicates",
  "typeVersion": 1.2,
  "position": [800, 400]
}
```

### Aggregate
**Category:** Data Processing  
**Description:** Performs aggregation operations on data, such as counting, summing, averaging, or grouping items. This node is useful for creating summary statistics or reports from your data.

```json
{
  "parameters": {
    "aggregate": "aggregateIndividualFields",
    "fieldsToAggregate": {
      "fieldToAggregate": [
        {
          "field": "amount",
          "operation": "sum"
        },
        {
          "field": "quantity",
          "operation": "average"
        }
      ]
    }
  },
  "name": "Aggregate",
  "type": "n8n-nodes-base.aggregate",
  "typeVersion": 1,
  "position": [1000, 400]
}
```

### Split Out
**Category:** Data Processing  
**Description:** Splits array fields into separate items. If you have an item with an array field, this node will create separate items for each array element.

```json
{
  "parameters": {
    "fieldToSplitOut": "items",
    "options": {}
  },
  "name": "Split Out",
  "type": "n8n-nodes-base.splitOut",
  "typeVersion": 1,
  "position": [400, 700]
}
```

### Compare Datasets
**Category:** Data Processing  
**Description:** Compares two datasets and identifies differences, similarities, or changes between them. This node is useful for data synchronization and change detection workflows.

```json
{
  "parameters": {
    "compareBy": "fields",
    "fieldsToCompare": {
      "fields": [
        {
          "fieldName": "id"
        }
      ]
    },
    "options": {}
  },
  "name": "Compare Datasets",
  "type": "n8n-nodes-base.compareDatasets",
  "typeVersion": 1,
  "position": [600, 700]
}
```

---

## AI & LangChain Nodes

### AI Agent
**Category:** AI / LangChain  
**Description:** Creates an AI agent that can use tools and make decisions. The AI Agent node can be configured with different agent types (conversational, ReAct, etc.) and can access various tools to help answer questions or complete tasks.

```json
{
  "parameters": {
    "agent": "conversationalAgent",
    "promptType": "auto",
    "options": {}
  },
  "name": "AI Agent",
  "type": "n8n-nodes-langchain.agent",
  "typeVersion": 1.7,
  "position": [200, 800]
}
```

### OpenAI Chat Model
**Category:** AI / LangChain  
**Description:** Interfaces with OpenAI's chat models (like GPT-4, GPT-3.5-turbo) for conversational AI interactions. This node can be used within LangChain workflows to generate responses, analyze text, or perform various AI tasks.

```json
{
  "parameters": {
    "model": "gpt-4",
    "options": {
      "temperature": 0.7,
      "maxTokens": 1000
    }
  },
  "name": "OpenAI Chat Model",
  "type": "n8n-nodes-langchain.lmChatOpenAi",
  "typeVersion": 1,
  "position": [400, 800]
}
```

### Anthropic Chat Model
**Category:** AI / LangChain  
**Description:** Interfaces with Anthropic's Claude models for AI conversations and text processing. This node provides access to Claude's capabilities within LangChain workflows.

```json
{
  "parameters": {
    "model": "claude-3-sonnet-20240229",
    "options": {
      "temperature": 0.7,
      "maxTokens": 1000
    }
  },
  "name": "Anthropic Chat Model",
  "type": "n8n-nodes-langchain.lmChatAnthropic",
  "typeVersion": 1,
  "position": [600, 800]
}
```

### Vector Store Pinecone
**Category:** AI / LangChain  
**Description:** Connects to Pinecone vector database for storing and querying vector embeddings. This node is essential for building AI applications that require semantic search or long-term memory capabilities.

```json
{
  "parameters": {
    "pineconeIndex": "my-index",
    "pineconeNamespace": "default"
  },
  "name": "Vector Store Pinecone",
  "type": "n8n-nodes-langchain.vectorStorePinecone",
  "typeVersion": 1,
  "position": [800, 800]
}
```

### Embeddings OpenAI
**Category:** AI / LangChain  
**Description:** Generates vector embeddings using OpenAI's embedding models. These embeddings can be stored in vector databases or used for similarity comparisons.

```json
{
  "parameters": {
    "model": "text-embedding-ada-002"
  },
  "name": "Embeddings OpenAI",
  "type": "n8n-nodes-langchain.embeddingsOpenAi",
  "typeVersion": 1,
  "position": [1000, 800]
}
```

### Memory Chat Memory
**Category:** AI / LangChain  
**Description:** Provides memory capabilities for AI conversations, allowing agents to remember previous interactions and maintain context across multiple exchanges.

```json
{
  "parameters": {
    "sessionIdType": "fromInput",
    "sessionKey": "sessionId"
  },
  "name": "Memory Chat Memory",
  "type": "n8n-nodes-langchain.memoryChatMemory",
  "typeVersion": 1,
  "position": [200, 1000]
}
```

### Tool Calculator
**Category:** AI / LangChain  
**Description:** Provides a calculator tool that AI agents can use to perform mathematical calculations. This tool extends the agent's capabilities to handle numeric computations.

```json
{
  "parameters": {},
  "name": "Tool Calculator",
  "type": "n8n-nodes-langchain.toolCalculator",
  "typeVersion": 1,
  "position": [400, 1000]
}
```

### Tool HTTP Request
**Category:** AI / LangChain  
**Description:** Allows AI agents to make HTTP requests to external APIs. This tool significantly expands what agents can do by giving them access to web services and APIs.

```json
{
  "parameters": {
    "method": "GET",
    "url": "https://api.example.com/data",
    "options": {}
  },
  "name": "Tool HTTP Request",
  "type": "n8n-nodes-langchain.toolHttpRequest",
  "typeVersion": 1.1,
  "position": [600, 1000]
}
```

---

## App Integration Nodes

### Gmail
**Category:** App Integration  
**Description:** Integrates with Gmail to send emails, read messages, manage labels, and perform other email operations. This node provides comprehensive Gmail functionality within workflows.

```json
{
  "parameters": {
    "operation": "send",
    "subject": "Workflow Notification",
    "message": "This is an automated message from n8n workflow.",
    "toList": "recipient@example.com"
  },
  "name": "Gmail",
  "type": "n8n-nodes-base.gmail",
  "typeVersion": 2.1,
  "position": [200, 1200]
}
```

### Google Sheets
**Category:** App Integration  
**Description:** Integrates with Google Sheets to read, write, and manipulate spreadsheet data. This node is essential for workflows that need to work with tabular data stored in Google Sheets.

```json
{
  "parameters": {
    "operation": "appendOrUpdate",
    "documentId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "sheetName": "Sheet1",
    "columns": {
      "mappingMode": "defineBelow",
      "value": {
        "Name": "={{$json.name}}",
        "Email": "={{$json.email}}",
        "Date": "={{$json.date}}"
      }
    },
    "options": {}
  },
  "name": "Google Sheets",
  "type": "n8n-nodes-base.googleSheets",
  "typeVersion": 4.4,
  "position": [400, 1200]
}
```

### Slack
**Category:** App Integration  
**Description:** Integrates with Slack to send messages, create channels, manage users, and perform other Slack operations. This node enables workflow notifications and team communication automation.

```json
{
  "parameters": {
    "operation": "postMessage",
    "channel": "#general",
    "text": "Workflow completed successfully!",
    "otherOptions": {}
  },
  "name": "Slack",
  "type": "n8n-nodes-base.slack",
  "typeVersion": 2.2,
  "position": [600, 1200]
}
```

### Discord
**Category:** App Integration  
**Description:** Integrates with Discord to send messages, manage channels, and interact with Discord servers. This node is useful for community management and gaming-related workflows.

```json
{
  "parameters": {
    "operation": "sendMessage",
    "channelId": "123456789012345678",
    "content": "Hello from n8n workflow!"
  },
  "name": "Discord",
  "type": "n8n-nodes-base.discord",
  "typeVersion": 2,
  "position": [800, 1200]
}
```

### Airtable
**Category:** App Integration  
**Description:** Integrates with Airtable to manage records in Airtable bases. This node provides full CRUD operations for Airtable data, making it easy to use Airtable as a database for workflows.

```json
{
  "parameters": {
    "operation": "create",
    "application": "appXXXXXXXXXXXXXX",
    "table": "Table 1",
    "columns": {
      "mappingMode": "defineBelow",
      "value": {
        "Name": "={{$json.name}}",
        "Status": "={{$json.status}}"
      }
    }
  },
  "name": "Airtable",
  "type": "n8n-nodes-base.airtable",
  "typeVersion": 1,
  "position": [1000, 1200]
}
```

### GitHub
**Category:** App Integration  
**Description:** Integrates with GitHub to manage repositories, issues, pull requests, and other GitHub operations. This node is essential for DevOps and development workflows.

```json
{
  "parameters": {
    "operation": "createIssue",
    "owner": "username",
    "repository": "repo-name",
    "title": "New issue from workflow",
    "body": "This issue was created automatically by n8n workflow."
  },
  "name": "GitHub",
  "type": "n8n-nodes-base.github",
  "typeVersion": 1,
  "position": [200, 1400]
}
```

### Notion
**Category:** App Integration  
**Description:** Integrates with Notion to manage pages, databases, and blocks. This node allows workflows to interact with Notion workspaces for documentation and knowledge management automation.

```json
{
  "parameters": {
    "operation": "create",
    "resource": "databasePage",
    "databaseId": "database-id-here",
    "properties": {
      "Name": {
        "title": [
          {
            "text": {
              "content": "={{$json.title}}"
            }
          }
        ]
      }
    }
  },
  "name": "Notion",
  "type": "n8n-nodes-base.notion",
  "typeVersion": 2.2,
  "position": [400, 1400]
}
```

### Trello
**Category:** App Integration  
**Description:** Integrates with Trello to manage boards, lists, and cards. This node enables project management automation and task tracking workflows.

```json
{
  "parameters": {
    "operation": "create",
    "resource": "card",
    "boardId": "board-id-here",
    "listId": "list-id-here",
    "name": "={{$json.taskName}}",
    "description": "={{$json.taskDescription}}"
  },
  "name": "Trello",
  "type": "n8n-nodes-base.trello",
  "typeVersion": 1,
  "position": [600, 1400]
}
```

---

## Database Nodes

### MySQL
**Category:** Database  
**Description:** Connects to MySQL databases to execute queries, insert data, update records, and perform other database operations. This node provides full MySQL database integration capabilities.

```json
{
  "parameters": {
    "operation": "executeQuery",
    "query": "SELECT * FROM users WHERE status = 'active'",
    "options": {}
  },
  "name": "MySQL",
  "type": "n8n-nodes-base.mySql",
  "typeVersion": 2.4,
  "position": [200, 1600]
}
```

### PostgreSQL
**Category:** Database  
**Description:** Connects to PostgreSQL databases for comprehensive database operations. This node supports all standard SQL operations and PostgreSQL-specific features.

```json
{
  "parameters": {
    "operation": "executeQuery",
    "query": "INSERT INTO logs (message, created_at) VALUES ($1, $2)",
    "additionalFields": {
      "mode": "independently",
      "queryParameters": "={{$json.message}},={{$json.timestamp}}"
    }
  },
  "name": "PostgreSQL",
  "type": "n8n-nodes-base.postgres",
  "typeVersion": 2.5,
  "position": [400, 1600]
}
```

### MongoDB
**Category:** Database  
**Description:** Connects to MongoDB databases for NoSQL document operations. This node supports all MongoDB operations including find, insert, update, delete, and aggregation.

```json
{
  "parameters": {
    "operation": "insert",
    "collection": "users",
    "fields": "={{$json}}"
  },
  "name": "MongoDB",
  "type": "n8n-nodes-base.mongoDb",
  "typeVersion": 1.1,
  "position": [600, 1600]
}
```

### Redis
**Category:** Database  
**Description:** Connects to Redis for key-value operations, caching, and pub/sub messaging. This node provides access to Redis's high-performance data structure operations.

```json
{
  "parameters": {
    "operation": "set",
    "key": "={{$json.key}}",
    "value": "={{$json.value}}",
    "options": {}
  },
  "name": "Redis",
  "type": "n8n-nodes-base.redis",
  "typeVersion": 1,
  "position": [800, 1600]
}
```

### Supabase
**Category:** Database  
**Description:** Integrates with Supabase for database operations, authentication, and real-time subscriptions. This node provides comprehensive Supabase functionality.

```json
{
  "parameters": {
    "operation": "insert",
    "table": "profiles",
    "records": {
      "values": [
        {
          "name": "={{$json.name}}",
          "email": "={{$json.email}}"
        }
      ]
    }
  },
  "name": "Supabase",
  "type": "n8n-nodes-base.supabase",
  "typeVersion": 1,
  "position": [1000, 1600]
}
```

---

## Communication Nodes

### Send Email
**Category:** Communication  
**Description:** Sends emails using SMTP configuration. This node provides a simple way to send email notifications and reports from workflows.

```json
{
  "parameters": {
    "fromEmail": "noreply@example.com",
    "toEmail": "recipient@example.com",
    "subject": "Workflow Notification",
    "message": "Your workflow has completed successfully.",
    "options": {}
  },
  "name": "Send Email",
  "type": "n8n-nodes-base.sendEmail",
  "typeVersion": 1,
  "position": [200, 1800]
}
```

### Twilio
**Category:** Communication  
**Description:** Integrates with Twilio for SMS, voice calls, and other communication services. This node enables workflows to send notifications via SMS or make automated phone calls.

```json
{
  "parameters": {
    "operation": "send",
    "from": "+1234567890",
    "to": "+0987654321",
    "message": "Hello from n8n workflow!"
  },
  "name": "Twilio",
  "type": "n8n-nodes-base.twilio",
  "typeVersion": 1,
  "position": [400, 1800]
}
```

### Telegram
**Category:** Communication  
**Description:** Integrates with Telegram Bot API to send messages, manage chats, and interact with Telegram users. This node is useful for creating Telegram bots and notification systems.

```json
{
  "parameters": {
    "operation": "sendMessage",
    "chatId": "123456789",
    "text": "Workflow notification from n8n!"
  },
  "name": "Telegram",
  "type": "n8n-nodes-base.telegram",
  "typeVersion": 1.2,
  "position": [600, 1800]
}
```

### WhatsApp Business
**Category:** Communication  
**Description:** Integrates with WhatsApp Business API for sending messages and managing WhatsApp business communications. This node enables automated customer communication via WhatsApp.

```json
{
  "parameters": {
    "operation": "sendMessage",
    "recipientPhoneNumber": "+1234567890",
    "message": "Hello from our business!"
  },
  "name": "WhatsApp Business",
  "type": "n8n-nodes-base.whatsApp",
  "typeVersion": 1,
  "position": [800, 1800]
}
```

---

## File & Storage Nodes

### Google Drive
**Category:** File & Storage  
**Description:** Integrates with Google Drive for file operations including upload, download, sharing, and folder management. This node provides comprehensive Google Drive functionality.

```json
{
  "parameters": {
    "operation": "upload",
    "name": "={{$json.filename}}",
    "parents": {
      "parentId": "folder-id-here"
    },
    "options": {}
  },
  "name": "Google Drive",
  "type": "n8n-nodes-base.googleDrive",
  "typeVersion": 3,
  "position": [200, 2000]
}
```

### Dropbox
**Category:** File & Storage  
**Description:** Integrates with Dropbox for file storage and sharing operations. This node allows workflows to upload, download, and manage files in Dropbox.

```json
{
  "parameters": {
    "operation": "upload",
    "remotePath": "/uploads/{{$json.filename}}",
    "binaryData": true,
    "binaryPropertyName": "data"
  },
  "name": "Dropbox",
  "type": "n8n-nodes-base.dropbox",
  "typeVersion": 2,
  "position": [400, 2000]
}
```

### AWS S3
**Category:** File & Storage  
**Description:** Integrates with Amazon S3 for cloud storage operations. This node provides comprehensive S3 functionality including bucket management and object operations.

```json
{
  "parameters": {
    "operation": "upload",
    "bucketName": "my-bucket",
    "fileName": "={{$json.filename}}",
    "binaryData": true,
    "binaryPropertyName": "data"
  },
  "name": "AWS S3",
  "type": "n8n-nodes-base.awsS3",
  "typeVersion": 1.2,
  "position": [600, 2000]
}
```

### FTP
**Category:** File & Storage  
**Description:** Connects to FTP servers for file transfer operations. This node supports both FTP and SFTP protocols for secure file transfers.

```json
{
  "parameters": {
    "operation": "upload",
    "remotePath": "/uploads/{{$json.filename}}",
    "binaryData": true,
    "binaryPropertyName": "data"
  },
  "name": "FTP",
  "type": "n8n-nodes-base.ftp",
  "typeVersion": 1,
  "position": [800, 2000]
}
```

---

## Development & DevOps Nodes

### Git
**Category:** Development & DevOps  
**Description:** Integrates with Git repositories for version control operations. This node can clone repositories, commit changes, and perform other Git operations.

```json
{
  "parameters": {
    "operation": "clone",
    "repositoryUrl": "https://github.com/user/repo.git",
    "localPath": "/tmp/repo"
  },
  "name": "Git",
  "type": "n8n-nodes-base.git",
  "typeVersion": 1,
  "position": [200, 2200]
}
```

### Docker
**Category:** Development & DevOps  
**Description:** Integrates with Docker for container management operations. This node can start, stop, and manage Docker containers as part of deployment workflows.

```json
{
  "parameters": {
    "operation": "containerStart",
    "containerId": "container-id-here"
  },
  "name": "Docker",
  "type": "n8n-nodes-base.docker",
  "typeVersion": 1,
  "position": [400, 2200]
}
```

### SSH
**Category:** Development & DevOps  
**Description:** Executes commands on remote servers via SSH. This node is essential for server management and deployment automation.

```json
{
  "parameters": {
    "command": "sudo systemctl restart nginx",
    "options": {}
  },
  "name": "SSH",
  "type": "n8n-nodes-base.ssh",
  "typeVersion": 1,
  "position": [600, 2200]
}
```

### Jenkins
**Category:** Development & DevOps  
**Description:** Integrates with Jenkins for CI/CD pipeline automation. This node can trigger builds, check build status, and manage Jenkins jobs.

```json
{
  "parameters": {
    "operation": "buildJob",
    "job": "my-build-job",
    "parameters": {}
  },
  "name": "Jenkins",
  "type": "n8n-nodes-base.jenkins",
  "typeVersion": 1,
  "position": [800, 2200]
}
```

---

## Additional Utility Nodes

### Date & Time
**Category:** Utility  
**Description:** Performs date and time operations including formatting, parsing, and calculations. This node is essential for workflows that need to work with temporal data.

```json
{
  "parameters": {
    "operation": "format",
    "date": "={{$json.timestamp}}",
    "format": "yyyy-MM-dd HH:mm:ss",
    "options": {}
  },
  "name": "Date & Time",
  "type": "n8n-nodes-base.dateTime",
  "typeVersion": 2,
  "position": [200, 2400]
}
```

### Crypto
**Category:** Utility  
**Description:** Provides cryptographic operations including hashing, encryption, and digital signatures. This node is useful for security-related workflows.

```json
{
  "parameters": {
    "operation": "hash",
    "algorithm": "sha256",
    "value": "={{$json.password}}"
  },
  "name": "Crypto",
  "type": "n8n-nodes-base.crypto",
  "typeVersion": 1,
  "position": [400, 2400]
}
```

### HTML
**Category:** Utility  
**Description:** Extracts data from HTML content using CSS selectors or XPath. This node is essential for web scraping and HTML processing workflows.

```json
{
  "parameters": {
    "operation": "extractHtmlContent",
    "extractionValues": {
      "values": [
        {
          "key": "title",
          "cssSelector": "h1",
          "returnValue": "text"
        }
      ]
    }
  },
  "name": "HTML",
  "type": "n8n-nodes-base.html",
  "typeVersion": 1.2,
  "position": [600, 2400]
}
```

### XML
**Category:** Utility  
**Description:** Parses and manipulates XML data. This node can convert between XML and JSON formats and extract specific data from XML documents.

```json
{
  "parameters": {
    "operation": "toJson",
    "dataPropertyName": "data",
    "options": {}
  },
  "name": "XML",
  "type": "n8n-nodes-base.xml",
  "typeVersion": 1,
  "position": [800, 2400]
}
```

### Compression
**Category:** Utility  
**Description:** Compresses and decompresses files using various algorithms. This node supports ZIP, GZIP, and other compression formats.

```json
{
  "parameters": {
    "operation": "compress",
    "format": "zip",
    "binaryPropertyName": "data"
  },
  "name": "Compression",
  "type": "n8n-nodes-base.compression",
  "typeVersion": 1,
  "position": [1000, 2400]
}
```

---

## Conclusion

This comprehensive reference covers all major n8n nodes available for the AgentX Vibe Coding project. Each node includes:

- **Description**: What the node does and when to use it
- **Configuration**: JSON configuration examples with common parameters
- **Category**: Logical grouping for easy navigation

### Usage Tips:

1. **Start Simple**: Begin with basic nodes like Manual Trigger, HTTP Request, and Set
2. **Test Incrementally**: Test each node individually before building complex workflows
3. **Use Expressions**: Leverage n8n's expression system (={{...}}) for dynamic data processing
4. **Error Handling**: Always include error handling nodes for production workflows
5. **Documentation**: Keep your workflows well-documented with descriptive node names

### Best Practices:

- Use consistent naming conventions for nodes
- Group related operations logically
- Implement proper error handling and logging
- Test workflows thoroughly before deployment
- Use sub-workflows for reusable logic
- Monitor workflow performance and optimize as needed

This reference should serve as your go-to guide for implementing any n8n workflow in the AgentX Vibe Coding project.