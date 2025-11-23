#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { 
  loadConfig, 
  saveConfig, 
  ServerConfig, 
  CONFIG_PATH,
  ensureConfigDir
} from './utils/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('mcp-gateway')
  .description('MCP Gateway - Aggregate multiple MCP servers')
  .version('1.0.0');

// Start command
program
  .command('start')
  .description('Start the MCP gateway server')
  .option('-c, --config <path>', 'Path to config file', CONFIG_PATH)
  .action(async (options) => {
    console.log(chalk.blue('🚀 Starting MCP Gateway...'));
    
    const gatewayPath = path.join(__dirname, 'gateway-server.js');
    const child = spawn('node', [gatewayPath], {
      stdio: 'inherit',
      env: {
        ...process.env,
        MCP_GATEWAY_CONFIG: options.config,
      },
    });

    child.on('error', (error) => {
      console.error(chalk.red('Failed to start gateway:'), error);
      process.exit(1);
    });

    child.on('exit', (code) => {
      if (code !== 0) {
        console.error(chalk.red(`Gateway exited with code ${code}`));
        process.exit(code || 1);
      }
    });
  });

// List command
program
  .command('list')
  .description('List all configured servers')
  .action(async () => {
    const config = await loadConfig();
    
    if (config.servers.length === 0) {
      console.log(chalk.yellow('No servers configured yet.'));
      console.log(chalk.dim('Use "mcp-gateway add" to add a server.'));
      return;
    }

    console.log(chalk.bold('\n📦 Configured Servers:\n'));
    
    // Group servers
    const groups: Record<string, ServerConfig[]> = {};
    for (const server of config.servers) {
      const group = server.group || 'default';
      if (!groups[group]) groups[group] = [];
      groups[group].push(server);
    }

    for (const [group, servers] of Object.entries(groups)) {
      console.log(chalk.blue.bold(`[ ${group} ]`));
      
      for (const server of servers) {
        const status = server.enabled 
          ? chalk.green('✓ enabled') 
          : chalk.dim('✗ disabled');
        
        console.log(`  ${chalk.bold(server.name)} ${status}`);
        console.log(chalk.dim(`    ID: ${server.id}`));
        console.log(chalk.dim(`    Command: ${server.command} ${server.args.join(' ')}`));
        console.log();
      }
    }
  });

// Add command
program
  .command('add')
  .description('Add a new MCP server')
  .requiredOption('-i, --id <id>', 'Server ID')
  .requiredOption('-n, --name <name>', 'Server name')
  .requiredOption('-c, --command <command>', 'Command to run')
  .option('-a, --args <args...>', 'Command arguments', [])
  .option('-e, --env <vars...>', 'Environment variables (KEY=VALUE)')
  .option('-g, --group <group>', 'Server group', 'default')
  .option('--disabled', 'Add server but keep it disabled')
  .action(async (options) => {
    const spinner = ora('Adding server...').start();

    try {
      const config = await loadConfig();

      // Check if server already exists
      if (config.servers.find(s => s.id === options.id)) {
        spinner.fail(chalk.red(`Server with ID "${options.id}" already exists`));
        return;
      }

      // Validate ID format (no underscores allowed)
      if (options.id.includes('_')) {
        spinner.fail(chalk.red(`Server ID "${options.id}" cannot contain underscores (_)`));
        return;
      }

      // Parse environment variables
      const env: Record<string, string> = {};
      if (options.env) {
        for (const envVar of options.env) {
          const [key, value] = envVar.split('=');
          if (key && value) {
            env[key] = value;
          }
        }
      }

      const server: ServerConfig = {
        id: options.id,
        name: options.name,
        command: options.command,
        args: options.args,
        enabled: !options.disabled,
        env: Object.keys(env).length > 0 ? env : undefined,
        group: options.group,
      };

      config.servers.push(server);
      await saveConfig(config);

      spinner.succeed(chalk.green(`Added server "${options.name}"`));
      console.log(chalk.dim(`  ID: ${options.id}`));
      console.log(chalk.dim(`  Group: ${options.group}`));
      console.log(chalk.dim(`  Status: ${server.enabled ? 'enabled' : 'disabled'}`));
    } catch (error) {
      spinner.fail(chalk.red('Failed to add server'));
      console.error(error);
    }
  });

// Remove command
program
  .command('remove <id>')
  .description('Remove a server')
  .action(async (id) => {
    const spinner = ora('Removing server...').start();

    try {
      const config = await loadConfig();
      const serverIndex = config.servers.findIndex(s => s.id === id);

      if (serverIndex === -1) {
        spinner.fail(chalk.red(`Server "${id}" not found`));
        return;
      }

      const server = config.servers[serverIndex];
      config.servers.splice(serverIndex, 1);
      await saveConfig(config);

      spinner.succeed(chalk.green(`Removed server "${server.name}"`));
    } catch (error) {
      spinner.fail(chalk.red('Failed to remove server'));
      console.error(error);
    }
  });

// Enable command
program
  .command('enable <id>')
  .description('Enable a server')
  .action(async (id) => {
    const spinner = ora('Enabling server...').start();

    try {
      const config = await loadConfig();
      const server = config.servers.find(s => s.id === id);

      if (!server) {
        spinner.fail(chalk.red(`Server "${id}" not found`));
        return;
      }

      server.enabled = true;
      await saveConfig(config);

      spinner.succeed(chalk.green(`Enabled server "${server.name}"`));
    } catch (error) {
      spinner.fail(chalk.red('Failed to enable server'));
      console.error(error);
    }
  });

// Disable command
program
  .command('disable <id>')
  .description('Disable a server')
  .action(async (id) => {
    const spinner = ora('Disabling server...').start();

    try {
      const config = await loadConfig();
      const server = config.servers.find(s => s.id === id);

      if (!server) {
        spinner.fail(chalk.red(`Server "${id}" not found`));
        return;
      }

      server.enabled = false;
      await saveConfig(config);

      spinner.succeed(chalk.green(`Disabled server "${server.name}"`));
    } catch (error) {
      spinner.fail(chalk.red('Failed to disable server'));
      console.error(error);
    }
  });

// Config command
program
  .command('config')
  .description('Generate client configuration')
  .option('-o, --output <type>', 'Output format (claude, vscode)', 'claude')
  .option('-g, --groups <groups>', 'Server groups to generate config for (comma-separated)', 'default')
  .action(async (options) => {
    const gatewayPath = path.join(__dirname, 'gateway-server.js');
    
    // Sanitize group name for the server ID (replace commas with dashes)
    const groups = options.groups;
    const serverName = 'mcp-gateway';
    
    const env = { MCP_GATEWAY_GROUPS: groups };

    const configs: Record<string, any> = {
      claude: {
        mcpServers: {
          [serverName]: {
            command: 'node',
            args: [gatewayPath],
            env,
          },
        },
      },
      vscode: {
        'servers': {
          [serverName]: {
            command: 'node',
            args: [gatewayPath],
            env,
          },
        },
      },
    };

    const config = configs[options.output] || configs.claude;
    
    console.log(chalk.bold('\n📝 Configuration:\n'));
    console.log(JSON.stringify(config, null, 2));
    console.log();
    console.log(chalk.dim('Add this to your client configuration file:'));
    
    if (options.output === 'claude') {
      console.log(chalk.dim('~/Library/Application Support/Claude/claude_desktop_config.json'));
    } else if (options.output === 'vscode') {
      console.log(chalk.dim('VS Code Settings → MCP'));
    }
    console.log();
  });

// Init command
program
  .command('init')
  .description('Initialize MCP Gateway with interactive setup')
  .action(async () => {
    console.log(chalk.bold.blue('\n🎉 Welcome to MCP Gateway!\n'));
    
    await ensureConfigDir();
    
    const config = await loadConfig();
    
    if (config.servers.length > 0) {
      console.log(chalk.yellow('Configuration already exists.'));
      console.log(chalk.dim(`Found ${config.servers.length} server(s) configured.\n`));
    } else {
      console.log(chalk.green('Configuration initialized!'));
      console.log(chalk.dim(`Config location: ${CONFIG_PATH}\n`));
    }

    console.log(chalk.bold('Quick Start:\n'));
    console.log(chalk.cyan('1. Add a server:'));
    console.log(chalk.dim('   mcp-gateway add --id github --name GitHub --command npx --args @modelcontextprotocol/server-github\n'));
    
    console.log(chalk.cyan('2. List servers:'));
    console.log(chalk.dim('   mcp-gateway list\n'));
    
    console.log(chalk.cyan('3. Start gateway:'));
    console.log(chalk.dim('   mcp-gateway start\n'));
    
    console.log(chalk.cyan('4. Generate config:'));
    console.log(chalk.dim('   mcp-gateway config\n'));
  });

program.parse();