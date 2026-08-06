import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import type { BackupRecord, BackupRecordType } from "@/types/backup-record";

/**
 * Architecture only - queues a BackupRecord and returns immediately. No real export/import
 * engine exists yet (no data is actually read/written beyond this one record); a future
 * phase would pick up "queued" records and perform the real work.
 */
async function queueBackupRecord(type: BackupRecordType, note?: string): Promise<string> {
  const col = await tenantCollection("backupHistory");
  const ref = col.doc();
  await ref.set({
    type,
    status: "queued" satisfies BackupRecord["status"],
    ...(note ? { note } : {}),
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function queueBackupExport(note?: string): Promise<string> {
  return queueBackupRecord("export", note);
}

export async function queueBackupImport(note?: string): Promise<string> {
  return queueBackupRecord("import", note);
}
