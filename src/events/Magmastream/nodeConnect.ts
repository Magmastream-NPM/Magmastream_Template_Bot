import { Node } from "magmastream";
import MagmastreamTemplateBot from "../../structures/Client";

export = (client: MagmastreamTemplateBot, node: Node) => {
  client.logger.ready(`Node "${node.options.identifier}" connected.`);
};
