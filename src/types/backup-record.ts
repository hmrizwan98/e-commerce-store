export type BackupRecordType = "export" | "import";
export type BackupRecordStatus = "queued" | "completed" | "failed";

/** Architecture only - no backup engine exists yet (see src/lib/firebase/services/backup-service.ts).
 * A record is created the moment a request is made and stays "queued" until a future phase
 * implements the actual export/import mechanism. */
export interface BackupRecord {
  id: string;
  type: BackupRecordType;
  status: BackupRecordStatus;
  note?: string;
  createdAt?: number;
}
