import { Command } from "commander";

const cli = new Command("node index.js");

const arrayAdd = (value, prev) => {
  prev.push(value);
  return prev;
};

cli
  .description("for migrate nodeeweb")
  .version("1.0.0")
  .option("--step <steps>", "steps: dirs, db, docker-service", arrayAdd, [])
  .option("-m, --model <model>", "add specific db model", arrayAdd, [])
  .option("--models-all", "add all available models")
  .option("-d, --db <db>", "identify db")
  .option("-s, --service <service>", "docker service")
  .option("--image <image>", "new docker image")
  .option("--domain <domain>", "docker service primary domain")
  .option("--name <name>", "docker service name")
  .option("--mongo_url <mongo_url>", "docker service mongo url connection")
  .option("--path <path>", "service absolute path");

cli.parse(process.argv);

export default cli;
