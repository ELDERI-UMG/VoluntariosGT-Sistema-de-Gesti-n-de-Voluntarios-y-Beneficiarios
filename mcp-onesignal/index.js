#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const ONESIGNAL_API_URL = 'https://onesignal.com/api/v1';

class OneSignalMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'onesignal-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_notification',
            description: 'Create and send a push notification',
            inputSchema: {
              type: 'object',
              properties: {
                app_id: {
                  type: 'string',
                  description: 'OneSignal App ID'
                },
                contents: {
                  type: 'object',
                  description: 'Message content in multiple languages',
                  properties: {
                    en: { type: 'string' },
                    es: { type: 'string' }
                  }
                },
                headings: {
                  type: 'object',
                  description: 'Message headings in multiple languages',
                  properties: {
                    en: { type: 'string' },
                    es: { type: 'string' }
                  }
                },
                included_segments: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Segments to target (default: ["All"])'
                },
                data: {
                  type: 'object',
                  description: 'Additional data to send with notification'
                },
                url: {
                  type: 'string',
                  description: 'URL to open when notification is clicked'
                }
              },
              required: ['app_id', 'contents']
            }
          },
          {
            name: 'get_notifications',
            description: 'Get list of notifications for an app',
            inputSchema: {
              type: 'object',
              properties: {
                app_id: {
                  type: 'string',
                  description: 'OneSignal App ID'
                },
                limit: {
                  type: 'number',
                  description: 'Number of notifications to retrieve (max 50)'
                },
                offset: {
                  type: 'number',
                  description: 'Offset for pagination'
                }
              },
              required: ['app_id']
            }
          },
          {
            name: 'get_notification',
            description: 'Get details of a specific notification',
            inputSchema: {
              type: 'object',
              properties: {
                app_id: {
                  type: 'string',
                  description: 'OneSignal App ID'
                },
                notification_id: {
                  type: 'string',
                  description: 'Notification ID'
                }
              },
              required: ['app_id', 'notification_id']
            }
          },
          {
            name: 'cancel_notification',
            description: 'Cancel a scheduled notification',
            inputSchema: {
              type: 'object',
              properties: {
                app_id: {
                  type: 'string',
                  description: 'OneSignal App ID'
                },
                notification_id: {
                  type: 'string',
                  description: 'Notification ID'
                }
              },
              required: ['app_id', 'notification_id']
            }
          },
          {
            name: 'get_apps',
            description: 'Get list of all apps',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          },
          {
            name: 'get_app',
            description: 'Get details of a specific app',
            inputSchema: {
              type: 'object',
              properties: {
                app_id: {
                  type: 'string',
                  description: 'OneSignal App ID'
                }
              },
              required: ['app_id']
            }
          },
          {
            name: 'create_app',
            description: 'Create a new OneSignal app',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'App name'
                },
                apns_env: {
                  type: 'string',
                  enum: ['sandbox', 'production'],
                  description: 'iOS environment'
                },
                organization_id: {
                  type: 'string',
                  description: 'Organization ID (optional)'
                }
              },
              required: ['name']
            }
          },
          {
            name: 'update_app',
            description: 'Update app settings',
            inputSchema: {
              type: 'object',
              properties: {
                app_id: {
                  type: 'string',
                  description: 'OneSignal App ID'
                },
                name: {
                  type: 'string',
                  description: 'App name'
                },
                site_name: {
                  type: 'string',
                  description: 'Website name'
                },
                subdomain: {
                  type: 'string',
                  description: 'Subdomain for web push'
                }
              },
              required: ['app_id']
            }
          },
          {
            name: 'get_players',
            description: 'Get list of players (devices) for an app',
            inputSchema: {
              type: 'object',
              properties: {
                app_id: {
                  type: 'string',
                  description: 'OneSignal App ID'
                },
                limit: {
                  type: 'number',
                  description: 'Number of players to retrieve (max 300)'
                },
                offset: {
                  type: 'number',
                  description: 'Offset for pagination'
                }
              },
              required: ['app_id']
            }
          },
          {
            name: 'get_player',
            description: 'Get details of a specific player',
            inputSchema: {
              type: 'object',
              properties: {
                app_id: {
                  type: 'string',
                  description: 'OneSignal App ID'
                },
                player_id: {
                  type: 'string',
                  description: 'Player ID'
                }
              },
              required: ['app_id', 'player_id']
            }
          },
          {
            name: 'create_segment',
            description: 'Create a new segment',
            inputSchema: {
              type: 'object',
              properties: {
                app_id: {
                  type: 'string',
                  description: 'OneSignal App ID'
                },
                name: {
                  type: 'string',
                  description: 'Segment name'
                },
                filters: {
                  type: 'array',
                  description: 'Segment filters'
                }
              },
              required: ['app_id', 'name', 'filters']
            }
          },
          {
            name: 'get_segments',
            description: 'Get list of segments for an app',
            inputSchema: {
              type: 'object',
              properties: {
                app_id: {
                  type: 'string',
                  description: 'OneSignal App ID'
                }
              },
              required: ['app_id']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const result = await this.handleToolCall(name, args);
        return result;
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing ${name}: ${error.message}`
        );
      }
    });
  }

  async handleToolCall(name, args) {
    const restApiKey = process.env.ONESIGNAL_REST_API_KEY;
    const userAuthKey = process.env.ONESIGNAL_USER_AUTH_KEY;

    if (!restApiKey) {
      throw new Error('ONESIGNAL_REST_API_KEY environment variable is required');
    }

    const headers = {
      'Authorization': `Basic ${restApiKey}`,
      'Content-Type': 'application/json'
    };

    switch (name) {
      case 'create_notification':
        return await this.createNotification(args, headers);
      
      case 'get_notifications':
        return await this.getNotifications(args, headers);
      
      case 'get_notification':
        return await this.getNotification(args, headers);
      
      case 'cancel_notification':
        return await this.cancelNotification(args, headers);
      
      case 'get_apps':
        if (!userAuthKey) {
          throw new Error('ONESIGNAL_USER_AUTH_KEY environment variable is required for this operation');
        }
        return await this.getApps({ ...headers, 'Authorization': `Basic ${userAuthKey}` });
      
      case 'get_app':
        return await this.getApp(args, headers);
      
      case 'create_app':
        if (!userAuthKey) {
          throw new Error('ONESIGNAL_USER_AUTH_KEY environment variable is required for this operation');
        }
        return await this.createApp(args, { ...headers, 'Authorization': `Basic ${userAuthKey}` });
      
      case 'update_app':
        return await this.updateApp(args, headers);
      
      case 'get_players':
        return await this.getPlayers(args, headers);
      
      case 'get_player':
        return await this.getPlayer(args, headers);
      
      case 'create_segment':
        return await this.createSegment(args, headers);
      
      case 'get_segments':
        return await this.getSegments(args, headers);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async createNotification(args, headers) {
    const payload = {
      app_id: args.app_id,
      contents: args.contents,
      headings: args.headings,
      included_segments: args.included_segments || ['All'],
      data: args.data,
      url: args.url
    };

    const response = await axios.post(`${ONESIGNAL_API_URL}/notifications`, payload, { headers });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            notification_id: response.data.id,
            recipients: response.data.recipients,
            external_id: response.data.external_id
          }, null, 2)
        }
      ]
    };
  }

  async getNotifications(args, headers) {
    const params = new URLSearchParams({
      app_id: args.app_id,
      limit: args.limit || 50,
      offset: args.offset || 0
    });

    const response = await axios.get(`${ONESIGNAL_API_URL}/notifications?${params}`, { headers });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };
  }

  async getNotification(args, headers) {
    const params = new URLSearchParams({ app_id: args.app_id });
    const response = await axios.get(`${ONESIGNAL_API_URL}/notifications/${args.notification_id}?${params}`, { headers });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };
  }

  async cancelNotification(args, headers) {
    const params = new URLSearchParams({ app_id: args.app_id });
    const response = await axios.delete(`${ONESIGNAL_API_URL}/notifications/${args.notification_id}?${params}`, { headers });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, message: 'Notification cancelled' }, null, 2)
        }
      ]
    };
  }

  async getApps(headers) {
    const response = await axios.get(`${ONESIGNAL_API_URL}/apps`, { headers });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };
  }

  async getApp(args, headers) {
    const response = await axios.get(`${ONESIGNAL_API_URL}/apps/${args.app_id}`, { headers });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };
  }

  async createApp(args, headers) {
    const payload = {
      name: args.name,
      apns_env: args.apns_env || 'production',
      organization_id: args.organization_id
    };

    const response = await axios.post(`${ONESIGNAL_API_URL}/apps`, payload, { headers });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };
  }

  async updateApp(args, headers) {
    const { app_id, ...payload } = args;
    const response = await axios.put(`${ONESIGNAL_API_URL}/apps/${app_id}`, payload, { headers });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };
  }

  async getPlayers(args, headers) {
    const params = new URLSearchParams({
      app_id: args.app_id,
      limit: args.limit || 300,
      offset: args.offset || 0
    });

    const response = await axios.get(`${ONESIGNAL_API_URL}/players?${params}`, { headers });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };
  }

  async getPlayer(args, headers) {
    const params = new URLSearchParams({ app_id: args.app_id });
    const response = await axios.get(`${ONESIGNAL_API_URL}/players/${args.player_id}?${params}`, { headers });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };
  }

  async createSegment(args, headers) {
    const payload = {
      name: args.name,
      filters: args.filters
    };

    const response = await axios.post(`${ONESIGNAL_API_URL}/apps/${args.app_id}/segments`, payload, { headers });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };
  }

  async getSegments(args, headers) {
    const response = await axios.get(`${ONESIGNAL_API_URL}/apps/${args.app_id}/segments`, { headers });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('OneSignal MCP server running on stdio');
  }
}

const server = new OneSignalMCPServer();
server.run().catch(console.error);