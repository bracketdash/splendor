import fs from "fs";
const packageJson = JSON.parse(fs.readFileSync("package.json"));
if (packageJson.type) {
  delete packageJson.type;
}
fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
