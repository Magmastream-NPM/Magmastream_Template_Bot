import {
  ChatInputCommandInteraction,
  Client,
  Collection,
  CommandInteraction,
  GatewayIntentBits,
  Partials,
  PermissionResolvable,
  PermissionsBitField,
  REST,
  Routes,
} from "discord.js";
import Logger from "./Logger";
import { readdirSync } from "fs";
import Magmastream from "./Magmastream";
import config from "../config";

export interface SlashCommand {
  /** 1-32 character name. https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-naming */
  name: string;
  /** 1-100 character description. */
  description?: string;
  /** Type of option. https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type */
  type?: number;
  /** The category the command will fall under. */
  category: string;
  /** If the option is a subcommand or subcommand group type, these nested options will be the parameters. */
  options: SlashCommandOptions[] | null;
  /** Permissions that members need in order to see this command. */
  default_member_permissions?: PermissionResolvable | string | null;
  /** Is this command for owner only? */
  owner?: boolean;
  /** Does this command require a user to be in a voice channel? */
  inVoiceChannel?: boolean;
  /** Does this command require a music player? */
  player?: boolean;
  /** Does this command require songs in the queue? */
  noCurrentQueue?: boolean;
  /** Does that command require the bot and user to be in the same voice channel? */
  inSameVoiceChannel?: boolean;
  run: (
    client: MagmastreamTemplateBot,
    interaction: ChatInputCommandInteraction | CommandInteraction
  ) => void | Promise<unknown>;
}

interface SlashCommandOptions {
  /** 1-32 character name. https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-naming */
  name: string;
  /** 1-100 character description. */
  description: string;
  /** If autocomplete interactions are enabled for this `STRING`, `INTEGER`, or `NUMBER` type option. NOTE: `autocomplete` may not be set to true if `choices` are present. */
  autocomplete?: boolean;
  /** If the parameter is required or optional--default false. */
  required?: boolean;
  /** Type of option. https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type */
  type?: number;
  /** Choices for `STRING`, `INTEGER`, and `NUMBER` types for the user to pick from, max 25. */
  choices?: SlashCommandChoices[];
  /** If the option is a subcommand or subcommand group type, these nested options will be the parameters. */
  options?: SlashCommandOptions[];
  /** If the option is an `INTEGER` or `NUMBER` type, the minimum value permitted. */
  min_value?: number;
  /** If the option is an `INTEGER` or `NUMBER` type, the maximum value permitted. */
  max_value?: number;
  /** For option type `STRING`, the minimum allowed length (minimum of `0`, maximum of `6000`). */
  min_length?: number;
  /** For option type `STRING`, the maximum allowed length (minimum of `1`, maximum of `6000`). */
  max_length?: number;
}

interface SlashCommandChoices {
  name: string;
  value: string | number;
}

export default class MagmastreamTemplateBot extends Client {
  config: typeof config;
  logger: Logger;
  manager: Magmastream;
  slashCommands: Collection<string, SlashCommand>;
  constructor() {
    super({
      allowedMentions: {
        parse: ["users", "roles", "everyone"],
        repliedUser: false,
      },
      intents: [
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
      ],
      partials: [Partials.Channel, Partials.GuildMember, Partials.User],
    });

    this.config = require("../config.js");
    this.logger = new Logger({ displayDate: true, displayTimestamp: true });
    this.manager = new Magmastream(this);
    this.slashCommands = new Collection();
  }

  _loadClientEvents() {
    let i = 0;
    readdirSync("./dist/events/Client/").forEach((file) => {
      const event = require(`../events/Client/${file}`);
      this.on(event.name, (...args) => event.run(this, ...args));
      ++i;
    });
    this.logger.event(`Loaded a total of ${i} Discord client event(s)`);
  }

  async _loadSlashCommands() {
    let i = 0;
    const data = [];
    const files = readdirSync("./dist/slashCommands/").filter((files) =>
      files.endsWith(".js")
    );

    for (const file of files) {
      const slashCommand = require(`../slashCommands/${file}`);

      if (!slashCommand.name) {
        return new TypeError("SlashCommand missing name.");
      }

      if (!slashCommand.description) {
        return new TypeError("SlashCommand missing description.");
      }

      this.slashCommands.set(slashCommand.name, slashCommand);

      data.push({
        name: slashCommand.name,
        description: slashCommand.description,
        type: slashCommand.type,
        options: slashCommand.options ? slashCommand.options : null,
        default_member_permissions: slashCommand.default_member_permissions
          ? PermissionsBitField.resolve(
              slashCommand.default_member_permissions
            ).toString()
          : null,
      });

      i++;
    }

    this.logger.cmd(`Loaded a total of ${i} slash command(s)`);

    const rest = new REST({ version: "10" }).setToken(this.config.token);

    try {
      this.logger.info("Started refreshing application (/) commands.");
      await rest.put(Routes.applicationCommands(this.config.clientId), {
        body: data,
      });
      this.logger.info("Successfully reloaded application (/) commands.");
    } catch (error) {
      throw error;
    }
  }

  async connect() {
    await super.login(this.config.token);
    this._loadClientEvents();
    await this._loadSlashCommands();
  }
}
