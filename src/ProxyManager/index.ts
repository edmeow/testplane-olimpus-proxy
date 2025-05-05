import { writeFileSync, readFileSync } from "node:fs";
import { Solution, Result } from "./interfaces";

console.log("proxy manager init")

class ProxyManager {
  private static locked = false;
  private static cache = new Map<number, Solution>();
  private static url: string | null = null;

  static isLock() {
    return this.locked;
  }

  static async waitForUnlock() {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (!this.locked) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  }

  static getSolutionById(id: number) {
    return this.cache.get(id) || null;
  }

  static addResultToSolution(id: number, result: Result) {
    this.cache.get(id)?.results.push(result);
  }

  static changeProjectStateToPending(id: number, url: string) {
    if (this.locked) {
      throw new Error("Tryed to run test while another one was running");
    }

    this.locked = true;

    this.setEntryPoint(url);
  }
  static initEmptyProject(id: number) {
    const pendingSolution: Solution = {
      state: "not-started",
      type: "project",
      results: [],
      id,
    };

    this.cache.set(id, pendingSolution);
  }

  static resolve(id: number) {
    const solution = this.cache.get(id);
    if (solution) solution.state = "resolved";
    this.locked = false;
  }

  static setEntryPoint(url: string) {
    writeFileSync(".entry-point", url);
  }

  static getEntryPoint() {
    return readFileSync(".entry-point", "utf-8") || "";
  }
}

export default ProxyManager;
