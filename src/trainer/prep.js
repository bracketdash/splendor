import("fs").then((fs) => {
  const packageJson = JSON.parse(fs.readFileSync("package.json"));
  if (process.argv[2] === "--modulize") {
    packageJson.type = "module";
  } else {
    if (packageJson.type) {
      delete packageJson.type;
    }
  }
  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
});
