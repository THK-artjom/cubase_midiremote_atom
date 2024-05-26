import * as dotenv from "dotenv";
import { execaCommand } from "execa";

import { resolve } from "node:path";
import { defineConfig } from "tsup";

dotenv.config();
const copyCommand = process.env.COPY_COMMAND;

// Create a list of all available device configurations and their target directory names by
// enumerating the `src/devices` directory and parsing all `vendor` and `device` pragmas of the
// files therein.

const device = {
  vendorFolder: "PreSonus",
  deviceFolder: "ATOM",
  vendor: "PreSonus",
  device: "ATOM",
  targetFilename: `PreSonus_ATOM`,
  targetPath: `../../PreSonus/ATOM`,
};

export default defineConfig({
  entry: { [device.targetFilename]: "src/PreSonus_ATOM_CUSTOM.ts" },
  outDir: device.targetPath,
  clean: true,
  external: ["midiremote_api_v1"],
  noExternal: ["abbreviate", "core-js", "color-diff"],
  onSuccess: async () => {
    if (copyCommand) {
      await execaCommand(copyCommand, { shell: true, stdout: process.stdout });
    }
  },
  define: {
    SCRIPT_VERSION: `"${process.env.npm_package_version}"`,
    DEVICE_NAME: `"${device.device}"`,
    VENDOR_NAME: `"${device.vendor}"`,
  },
  target: "es5",
  esbuildPlugins: [
    {
      name: "device-config-loader",
      setup(build) {
        build.onResolve({ filter: /^current-device$/ }, () => ({
          path: resolve(),
        }));
      },
    },
  ],
}
);
