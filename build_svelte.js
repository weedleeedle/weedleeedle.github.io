// Builds svelte files and bundles them into the static site... idk how bundlers and javascript works...

import path from "path";
import fs from "fs/promises";
import * as rollup from "rollup";
import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";
import { pathToFileURL } from "url";

export async function svelteBuild(directoryPath, outputDir) {
  // Create the input directory if it doesn't exist already
  await fs.mkdir(directoryPath, { recursive: true });
  // Create the output dir if it doesn't exist already
  await fs.mkdir(outputDir, {recursive: true});

  const fileList = await fs.readdir(directoryPath);

  for (const file of fileList) {
    if (!file.endsWith(".svelte")) continue;

    const inputPath = path.join(directoryPath, file);
    const componentName = file.replace(".svelte", "");
    const source = await fs.readFile(inputPath, "utf-8");

    // Generate server side javascript
    const serverFilePath = path.join(outputDir, file.replace(".svelte", ".server.js"));
    const ssr = compile(source, {
      generate: "server"
    });
    await fs.writeFile(serverFilePath, ssr.js.code, "utf-8");

    // Generate client side javascript
    // We need this as a wrapper around our generated HTML
    
    // This is where .client.js will end up on the server.
    // Importing this shit is so fucking weird
    const tempFilePath = path.join(outputDir, file.replace(".svelte", ".entry.js"));
    const relativePath = path.relative(path.dirname(tempFilePath), inputPath)
    const entrySource = `
      import { hydrate } from "svelte";
      import Component from ${JSON.stringify("./" + relativePath)};
      const el = document.querySelector('[data-svelte-component="${componentName}"]');
      hydrate(Component, {
        target: el,
        props: window.__svelteProps?.${componentName} ?? {}
      });
    `;

    await fs.writeFile(tempFilePath, entrySource, "utf-8");

    const clientFilePath = path.join(outputDir, file.replace(".svelte", ".client.js"));

    const clientBundle = await rollup.rollup({
      input: tempFilePath,
      plugins: [
        svelte({
          compilerOptions: {
            generate: "client",
            dev: false,
          }
        }),
        resolve({
          browser: true,
          exportConditions: ["svelte"],
          extensions: [".svelte", ".js"],
          dedupe: ["svelte"],
        }),
        commonjs()
      ]
    });

    const clientOutput = await clientBundle.generate({
      format: "iife",
    });

    // Okay now we WRITE this output to our output directory.
    await fs.writeFile(clientFilePath, clientOutput.output[0].code, "utf-8");
  }
}

export async function svelteShortCode(buildDir, componentName, props = {}) {
  const basePath = path.join(
    buildDir,
    componentName
  );

  const serverMod = await import(pathToFileURL(basePath + ".server.js").href);
  const clientPath = "/" + path.join("scripts/components", componentName + ".client.js");

  const Component = serverMod.default;

  // This generates the server side HTML
  const { body } = render(Component, { props });

  // Now we hydrate it
  // This has to be processed through this and THEN liquid lmao
  return `
    <div data-svelte-component="${componentName}">
      ${body}
    </div>
    <script src="${clientPath}"></script>
  `;
}
