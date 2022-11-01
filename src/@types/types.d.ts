export interface VoiceLog {
  nickname: string;
  time: string;
  type: "join" | "leave";
}
