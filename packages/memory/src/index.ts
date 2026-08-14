import type { MemoryRecord } from "@ai-os/ai-core";

export interface MemoryStore {
  put(record: MemoryRecord): Promise<void>;
  search(projectId: string, query: string, limit?: number): Promise<MemoryRecord[]>;
  delete(projectId: string, recordId: string): Promise<void>;
}

export class InMemoryStore implements MemoryStore {
  private readonly records = new Map<string, MemoryRecord>();

  async put(record: MemoryRecord): Promise<void> {
    this.records.set(record.id, record);
  }

  async search(projectId: string, query: string, limit = 10): Promise<MemoryRecord[]> {
    const q = query.toLowerCase();
    return [...this.records.values()]
      .filter((record) => record.projectId === projectId && record.content.toLowerCase().includes(q))
      .slice(0, limit);
  }

  async delete(projectId: string, recordId: string): Promise<void> {
    const record = this.records.get(recordId);
    if (record?.projectId === projectId) this.records.delete(recordId);
  }
}
