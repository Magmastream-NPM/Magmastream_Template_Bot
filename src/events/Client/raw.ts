import { VoicePacket, VoiceServer, VoiceState } from "magmastream";
import MagmastreamTemplateBot from "../../structures/Client";

export = {
  name: "raw",
  run: async (
    client: MagmastreamTemplateBot,
    data: VoicePacket | VoiceServer | VoiceState
  ) => {
    client.manager.updateVoiceState(data);
  },
};
