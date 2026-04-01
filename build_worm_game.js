import fs from "fs/promises"
import child_process from "child_process";
import path from "node:path";

export default async function() {
  //await fs.mkdir("build/worm_game");
  const export_file = path.join(process.cwd(), "src/_includes/build/worm_game/worm_game.html");
  const project_file = path.join(process.cwd(), "submodules/worm-game/project.godot");
  console.log(export_file);
  console.log(project_file);
  const godot = child_process.spawn("godot", ["--headless", "--quiet", "--export-release", "Web", export_file, project_file]);
  godot.stderr.on('data', (data) => {
    console.log(`${data}`);
  });
  await new Promise((resolve) => {
    godot.on('close', resolve)
  });
  console.log("Ding!");
}
