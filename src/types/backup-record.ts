export type BackupRecordType = "export" | "import";
/** queued = requested (pending Super Admin), approved/rejected = Super Admin decision,
 * completed = Super Admin confirmed the backup was actually produced. */
export type BackupRecordStatus = "queued" | "approved" | "rejected" | "completed" | "failed";

/** Architecture only - no backup engine exists yet (see src/lib/firebase/services/backup-service.ts).
 * A record is created the moment a request is made and stays "queued" until a future phase
 * implements the actual export/import mechanism. */
export interface BackupRecord {
  id: string;
  type: BackupRecordType;
  status: BackupRecordStatus;
  note?: string;
  /** Super Admin's note on approve/reject/complete. */
  resolutionNote?: string;
  updatedAt?: number;
  createdAt?: number;
}
