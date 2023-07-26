const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  PermissionsBitField,
  REST,
  Routes,
} = require("discord.js");
const Logger = require("./Logger.js");
const { readdirSync } = require("fs");
const Magmastream = require("./Magmastream.js");

module.exports = class MagmastreamTemplateBot extends Client {
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
    readdirSync("./src/events/Client/").forEach((file) => {
      const event = require(`../events/Client/${file}`);
      this.on(event.name, (...args) => event.run(this, ...args));
      ++i;
    });
    this.logger.event(`Loaded a total of ${i} Discord client event(s)`);
  }

  async _loadSlashCommands() {
    let i = 0;
    const data = [];
    const files = readdirSync("./src/slashCommands/").filter((files) =>
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
};
