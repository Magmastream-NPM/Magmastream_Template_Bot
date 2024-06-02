import { Signale, SignaleConfig, DefaultMethods } from "signale";

type CustomMethods =
  | "info"
  | "warn"
  | "error"
  | "debug"
  | "cmd"
  | "event"
  | "ready";

interface CustomSignaleConfig extends SignaleConfig {
  types?: Partial<
    Record<
      CustomMethods,
      {
        badge: string;
        color: string;
        label: string;
      }
    >
  >;
}

export default class Logger extends Signale {
  constructor(config: CustomSignaleConfig | undefined) {
    super({
      config: config,
      types: {
        info: {
          badge: "ℹ",
          color: "blue",
          label: "info",
        },
        warn: {
          badge: "⚠",
          color: "yellow",
          label: "warn",
        },
        error: {
          badge: "✖",
          color: "red",
          label: "error",
        },
        debug: {
          badge: "🐛",
          color: "magenta",
          label: "debug",
        },
        cmd: {
          badge: "⌨️",
          color: "green",
          label: "cmd",
        },
        event: {
          badge: "🎫",
          color: "cyan",
          label: "event",
        },
        ready: {
          badge: "✔️",
          color: "green",
          label: "ready",
        },
      },
    } as CustomSignaleConfig);
  }

  event(message: string) {
    this.scope("event").info(message);
  }

  cmd(message: string) {
    this.scope("cmd").info(message);
  }

  ready(message: string) {
    this.scope("ready").info(message);
  }
}
