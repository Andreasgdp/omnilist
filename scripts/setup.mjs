import "./load-env.mjs";

import { spawn } from "node:child_process";

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
      env: process.env,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });

    child.on("error", reject);
  });

try {
  await run("npm", ["run", "db:up"]);
  await run("npm", ["run", "db:migrate"]);
  await run("npm", ["run", "check:ready"]);
  await run("npm", ["run", "db:seed"]);
  console.log("Local setup complete.");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
