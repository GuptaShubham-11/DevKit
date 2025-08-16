import { IPackageManager } from '@/models/packageManager';
import { IProjectOption } from '@/models/projectOption';

export class CommandGeneratorService {
  static generateCommandText(
    projectName: string,
    projectCategory: string,
    packageManager: IPackageManager,
    selectedOptions: IProjectOption[],
    customOptions: string[] = []
  ): string {
    const commands: string[] = [];

    // Header comment
    commands.push(
      `# Generated commands for ${projectName} (${projectCategory})`
    );
    commands.push(`# Package Manager: ${packageManager.displayName}`);
    commands.push('');

    // Initial setup
    commands.push('# 📁 Project Setup');
    commands.push(`mkdir ${projectName}`);
    commands.push(`cd ${projectName}`);
    commands.push('');

    // Initialize project if needed
    const needsInit = selectedOptions.some(
      (opt) => opt.optionType === 'package' || opt.command.includes('install')
    );

    if (needsInit) {
      commands.push('# 🚀 Initialize Project');
      commands.push(`${packageManager.installCmd} init -y`);
      commands.push('');
    }

    // Group options by type for better organization
    const optionGroups = this.groupOptionsByType(selectedOptions);

    // Create folders first
    if (optionGroups.folder?.length > 0) {
      commands.push('# 📂 Create Project Structure');
      optionGroups.folder.forEach((option) => {
        const processedCommand = this.processCommand(
          option.command,
          packageManager,
          projectName
        );
        commands.push(processedCommand);
      });
      commands.push('');
    }

    // Install packages
    if (optionGroups.package?.length > 0) {
      commands.push('# 📦 Install Packages');
      const packages = optionGroups.package.map((option) =>
        this.processCommand(option.command, packageManager, projectName)
      );
      commands.push(...packages);
      commands.push('');
    }

    // Create config files
    if (optionGroups.config?.length > 0) {
      commands.push('# ⚙️ Configuration Files');
      optionGroups.config.forEach((option) => {
        const processedCommand = this.processCommand(
          option.command,
          packageManager,
          projectName
        );
        commands.push(processedCommand);
      });
      commands.push('');
    }

    // Create additional files
    if (optionGroups.file?.length > 0) {
      commands.push('# 📄 Create Files');
      optionGroups.file.forEach((option) => {
        const processedCommand = this.processCommand(
          option.command,
          packageManager,
          projectName
        );
        commands.push(processedCommand);
      });
      commands.push('');
    }

    // Setup/initialization commands
    if (optionGroups.setup?.length > 0) {
      commands.push('# 🔧 Setup & Configuration');
      optionGroups.setup.forEach((option) => {
        const processedCommand = this.processCommand(
          option.command,
          packageManager,
          projectName
        );
        commands.push(processedCommand);
      });
      commands.push('');
    }

    // Add custom options
    if (customOptions.length > 0) {
      commands.push('# 🎯 Custom Commands');
      customOptions.forEach((customCmd) => {
        const processedCommand = this.processCommand(
          customCmd,
          packageManager,
          projectName
        );
        commands.push(processedCommand);
      });
      commands.push('');
    }

    // Development commands
    commands.push('# 🏃 Ready to Start Development');
    if (packageManager.devCmd) {
      commands.push(`${packageManager.devCmd}`);
    }
    commands.push('');
    commands.push('# 🎉 Your project setup is ready!');

    return commands.join('\n');
  }

  static processCommand(
    command: string,
    packageManager: IPackageManager,
    projectName: string
  ): string {
    return command
      .replace(/{{projectName}}/g, projectName)
      .replace(/{{pm}}/g, packageManager.name)
      .replace(/{{pm\.installCmd}}/g, packageManager.installCmd)
      .replace(
        /{{pm\.addPackageCmd}}/g,
        packageManager.addPackageCmd || 'install'
      )
      .replace(/{{pm\.devCmd}}/g, packageManager.devCmd || 'run dev')
      .replace(/{{pm\.buildCmd}}/g, packageManager.buildCmd || 'run build')
      .replace(/{{packageManager}}/g, packageManager.installCmd)
      .trim();
  }

  static groupOptionsByType(
    options: IProjectOption[]
  ): Record<string, IProjectOption[]> {
    return options.reduce(
      (groups, option) => {
        const type = option.optionType || 'setup';
        if (!groups[type]) {
          groups[type] = [];
        }
        groups[type].push(option);
        return groups;
      },
      {} as Record<string, IProjectOption[]>
    );
  }

  static generateProjectStructure(
    projectName: string,
    options: IProjectOption[]
  ): string[] {
    const structure = [`${projectName}/`];

    options.forEach((option) => {
      if (option.optionType === 'folder') {
        structure.push(`├── 📂 ${option.name}/`);
      } else if (option.optionType === 'file') {
        structure.push(`├── 📑 ${option.name}`);
      }
    });

    structure.push('├── ..........');
    return structure;
  }
}
