#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';

class SupabaseMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'supabase-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.supabase = null;
    this.supabaseAdmin = null;
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  initializeClients() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    if (supabaseServiceKey) {
      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    }
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'query_table',
            description: 'Query data from a Supabase table with optional filters',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  description: 'Table name to query'
                },
                select: {
                  type: 'string',
                  description: 'Columns to select (default: *)',
                  default: '*'
                },
                filters: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      column: { type: 'string' },
                      operator: { type: 'string', enum: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'in'] },
                      value: { type: 'string' }
                    },
                    required: ['column', 'operator', 'value']
                  },
                  description: 'Array of filter conditions'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of rows to return'
                },
                order: {
                  type: 'object',
                  properties: {
                    column: { type: 'string' },
                    ascending: { type: 'boolean', default: true }
                  },
                  description: 'Order results by column'
                },
                use_admin: {
                  type: 'boolean',
                  description: 'Use admin client to bypass RLS',
                  default: false
                }
              },
              required: ['table']
            }
          },
          {
            name: 'insert_data',
            description: 'Insert new data into a Supabase table',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  description: 'Table name to insert into'
                },
                data: {
                  type: 'array',
                  items: { type: 'object' },
                  description: 'Array of objects to insert'
                },
                use_admin: {
                  type: 'boolean',
                  description: 'Use admin client to bypass RLS',
                  default: false
                }
              },
              required: ['table', 'data']
            }
          },
          {
            name: 'update_data',
            description: 'Update data in a Supabase table',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  description: 'Table name to update'
                },
                data: {
                  type: 'object',
                  description: 'Data to update'
                },
                filters: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      column: { type: 'string' },
                      operator: { type: 'string', enum: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte'] },
                      value: { type: 'string' }
                    },
                    required: ['column', 'operator', 'value']
                  },
                  description: 'Array of filter conditions for update'
                },
                use_admin: {
                  type: 'boolean',
                  description: 'Use admin client to bypass RLS',
                  default: false
                }
              },
              required: ['table', 'data', 'filters']
            }
          },
          {
            name: 'delete_data',
            description: 'Delete data from a Supabase table',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  description: 'Table name to delete from'
                },
                filters: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      column: { type: 'string' },
                      operator: { type: 'string', enum: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte'] },
                      value: { type: 'string' }
                    },
                    required: ['column', 'operator', 'value']
                  },
                  description: 'Array of filter conditions for deletion'
                },
                use_admin: {
                  type: 'boolean',
                  description: 'Use admin client to bypass RLS',
                  default: false
                }
              },
              required: ['table', 'filters']
            }
          },
          {
            name: 'count_rows',
            description: 'Count rows in a Supabase table with optional filters',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  description: 'Table name to count'
                },
                filters: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      column: { type: 'string' },
                      operator: { type: 'string', enum: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike'] },
                      value: { type: 'string' }
                    },
                    required: ['column', 'operator', 'value']
                  },
                  description: 'Array of filter conditions'
                },
                use_admin: {
                  type: 'boolean',
                  description: 'Use admin client to bypass RLS',
                  default: false
                }
              },
              required: ['table']
            }
          },
          {
            name: 'execute_rpc',
            description: 'Execute a Supabase stored procedure (RPC)',
            inputSchema: {
              type: 'object',
              properties: {
                function_name: {
                  type: 'string',
                  description: 'Name of the stored procedure to execute'
                },
                parameters: {
                  type: 'object',
                  description: 'Parameters to pass to the function'
                },
                use_admin: {
                  type: 'boolean',
                  description: 'Use admin client to bypass RLS',
                  default: false
                }
              },
              required: ['function_name']
            }
          },
          {
            name: 'get_table_schema',
            description: 'Get schema information for a specific table',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  description: 'Table name to get schema for'
                },
                schema: {
                  type: 'string',
                  description: 'Schema name (default: public)',
                  default: 'public'
                }
              },
              required: ['table']
            }
          },
          {
            name: 'list_tables',
            description: 'List all tables in the database',
            inputSchema: {
              type: 'object',
              properties: {
                schema: {
                  type: 'string',
                  description: 'Schema name (default: public)',
                  default: 'public'
                }
              }
            }
          },
          {
            name: 'get_user_stats',
            description: 'Get statistics for VoluntariosGT users',
            inputSchema: {
              type: 'object',
              properties: {
                group_by: {
                  type: 'string',
                  enum: ['role', 'estado', 'departamento'],
                  description: 'How to group the statistics'
                }
              }
            }
          },
          {
            name: 'get_activity_stats',
            description: 'Get statistics for VoluntariosGT activities',
            inputSchema: {
              type: 'object',
              properties: {
                group_by: {
                  type: 'string',
                  enum: ['estado', 'categoria', 'entidad'],
                  description: 'How to group the statistics'
                },
                date_range: {
                  type: 'object',
                  properties: {
                    start_date: { type: 'string', format: 'date' },
                    end_date: { type: 'string', format: 'date' }
                  },
                  description: 'Optional date range filter'
                }
              }
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        this.initializeClients();
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
    switch (name) {
      case 'query_table':
        return await this.queryTable(args);
      
      case 'insert_data':
        return await this.insertData(args);
      
      case 'update_data':
        return await this.updateData(args);
      
      case 'delete_data':
        return await this.deleteData(args);
      
      case 'count_rows':
        return await this.countRows(args);
      
      case 'execute_rpc':
        return await this.executeRpc(args);
      
      case 'get_table_schema':
        return await this.getTableSchema(args);
      
      case 'list_tables':
        return await this.listTables(args);
      
      case 'get_user_stats':
        return await this.getUserStats(args);
      
      case 'get_activity_stats':
        return await this.getActivityStats(args);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async queryTable(args) {
    const client = args.use_admin ? this.supabaseAdmin : this.supabase;
    if (!client) {
      throw new Error('Supabase client not available');
    }

    let query = client.from(args.table).select(args.select || '*');

    // Apply filters
    if (args.filters) {
      args.filters.forEach(filter => {
        query = query[filter.operator](filter.column, filter.value);
      });
    }

    // Apply ordering
    if (args.order) {
      query = query.order(args.order.column, { ascending: args.order.ascending });
    }

    // Apply limit
    if (args.limit) {
      query = query.limit(args.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Query failed: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            table: args.table,
            count: data.length,
            data: data
          }, null, 2)
        }
      ]
    };
  }

  async insertData(args) {
    const client = args.use_admin ? this.supabaseAdmin : this.supabase;
    if (!client) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await client
      .from(args.table)
      .insert(args.data)
      .select();

    if (error) {
      throw new Error(`Insert failed: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            table: args.table,
            inserted_count: data.length,
            data: data
          }, null, 2)
        }
      ]
    };
  }

  async updateData(args) {
    const client = args.use_admin ? this.supabaseAdmin : this.supabase;
    if (!client) {
      throw new Error('Supabase client not available');
    }

    let query = client.from(args.table).update(args.data);

    // Apply filters
    args.filters.forEach(filter => {
      query = query[filter.operator](filter.column, filter.value);
    });

    const { data, error } = await query.select();

    if (error) {
      throw new Error(`Update failed: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            table: args.table,
            updated_count: data.length,
            data: data
          }, null, 2)
        }
      ]
    };
  }

  async deleteData(args) {
    const client = args.use_admin ? this.supabaseAdmin : this.supabase;
    if (!client) {
      throw new Error('Supabase client not available');
    }

    let query = client.from(args.table).delete();

    // Apply filters
    args.filters.forEach(filter => {
      query = query[filter.operator](filter.column, filter.value);
    });

    const { data, error } = await query.select();

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            table: args.table,
            deleted_count: data.length,
            data: data
          }, null, 2)
        }
      ]
    };
  }

  async countRows(args) {
    const client = args.use_admin ? this.supabaseAdmin : this.supabase;
    if (!client) {
      throw new Error('Supabase client not available');
    }

    let query = client.from(args.table).select('*', { count: 'exact', head: true });

    // Apply filters
    if (args.filters) {
      args.filters.forEach(filter => {
        query = query[filter.operator](filter.column, filter.value);
      });
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Count failed: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            table: args.table,
            count: count
          }, null, 2)
        }
      ]
    };
  }

  async executeRpc(args) {
    const client = args.use_admin ? this.supabaseAdmin : this.supabase;
    if (!client) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await client.rpc(args.function_name, args.parameters);

    if (error) {
      throw new Error(`RPC failed: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            function: args.function_name,
            data: data
          }, null, 2)
        }
      ]
    };
  }

  async getTableSchema(args) {
    if (!this.supabaseAdmin) {
      throw new Error('Admin client required for schema operations');
    }

    const { data, error } = await this.supabaseAdmin.rpc('get_table_schema', {
      table_name: args.table,
      schema_name: args.schema || 'public'
    });

    if (error) {
      throw new Error(`Schema query failed: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            table: args.table,
            schema: args.schema || 'public',
            columns: data
          }, null, 2)
        }
      ]
    };
  }

  async listTables(args) {
    if (!this.supabaseAdmin) {
      throw new Error('Admin client required for table listing');
    }

    const { data, error } = await this.supabaseAdmin
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', args.schema || 'public')
      .eq('table_type', 'BASE TABLE');

    if (error) {
      throw new Error(`Table listing failed: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            schema: args.schema || 'public',
            tables: data.map(t => t.table_name)
          }, null, 2)
        }
      ]
    };
  }

  async getUserStats(args) {
    const client = this.supabase;
    if (!client) {
      throw new Error('Supabase client not available');
    }

    let query = client.from('perfiles').select('*');
    
    const { data, error } = await query;

    if (error) {
      throw new Error(`User stats failed: ${error.message}`);
    }

    // Group by requested field
    const stats = {};
    data.forEach(user => {
      const key = user[args.group_by] || 'unknown';
      stats[key] = (stats[key] || 0) + 1;
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            total_users: data.length,
            grouped_by: args.group_by,
            statistics: stats
          }, null, 2)
        }
      ]
    };
  }

  async getActivityStats(args) {
    const client = this.supabase;
    if (!client) {
      throw new Error('Supabase client not available');
    }

    let query = client.from('actividades').select('*');

    // Apply date range filter if provided
    if (args.date_range) {
      if (args.date_range.start_date) {
        query = query.gte('fecha_inicio', args.date_range.start_date);
      }
      if (args.date_range.end_date) {
        query = query.lte('fecha_fin', args.date_range.end_date);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Activity stats failed: ${error.message}`);
    }

    // Group by requested field
    const stats = {};
    data.forEach(activity => {
      const key = activity[args.group_by] || 'unknown';
      stats[key] = (stats[key] || 0) + 1;
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            total_activities: data.length,
            grouped_by: args.group_by,
            date_range: args.date_range,
            statistics: stats
          }, null, 2)
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
    console.error('Supabase MCP server running on stdio');
  }
}

const server = new SupabaseMCPServer();
server.run().catch(console.error);