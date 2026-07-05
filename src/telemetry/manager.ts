import { EventEmitter } from "node:events";
import { TelemetryServer } from "./server";
import streamDeck from "@elgato/streamdeck";
import { ForzaTelemetryData, parseToForzaTelemetryData } from "./parser";

type TelemetryManagerEvents = {
  data: [data: ForzaTelemetryData];
  error: [err: Error];
};

export class TelemetryManager extends EventEmitter<TelemetryManagerEvents> {
  private static instance?: TelemetryManager;

  private readonly logger = streamDeck.logger.createScope(
    TelemetryManager.name,
  );

  private readonly server: TelemetryServer;
  private lastUpdate: number = 0;
  // 更新頻度を20FPS(50ms)に制限し、Stream Deck側の描画負荷を抑える
  private readonly updateIntervalMs: number = 50;

  private constructor() {
    super();
    this.server = new TelemetryServer();

    this.server.on("message", (msg) => {
      const now = Date.now();
      if (now - this.lastUpdate < this.updateIntervalMs) {
        return; // スロットリング
      }

      const data = parseToForzaTelemetryData(msg);
      if (data) {
        this.lastUpdate = now;
        this.emit("data", data);
      }
    });

    this.server.on("error", (err) => {
      this.emit("error", err);
    });
  }

  public static getInstance(): TelemetryManager {
    TelemetryManager.instance ??= new TelemetryManager();
    return TelemetryManager.instance;
  }

  public start(params?: { port?: number; address?: string }) {
    this.server.start(params);
  }

  public stop() {
    this.server.stop();
  }
}
