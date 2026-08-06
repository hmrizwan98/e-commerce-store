import "server-only";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData } from "./utils";
import type { BackupRecord } from "@/types/backup-record";

const COLLECTION = "backupHistory";

export async function getBackupHistory(limit = 20): Promise<BackupRecord[]> {
  const snap = await (await tenantCollection(COLLECTION)).orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs
    .map((doc) => docData<BackupRecord>(doc))
    .filter((record): record is BackupRecord => record !== null);
}
