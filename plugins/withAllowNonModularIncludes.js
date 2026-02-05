const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withAllowNonModularIncludes = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const file = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
      const contents = await fs.promises.readFile(file, 'utf8');
      if (!contents.includes("allow_non_modular_includes_in_framework_modules!")) {
        await fs.promises.writeFile(
          file,
          contents + "\n$allow_non_modular_includes_in_framework_modules = true\n"
        );
      }
      return config;
    },
  ]);
};

module.exports = withAllowNonModularIncludes;
