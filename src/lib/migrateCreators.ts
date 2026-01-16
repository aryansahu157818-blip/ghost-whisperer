import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

function handleFromEmail(email: string) {
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  const num = Math.floor(100 + Math.random() * 900);
  return `@ghost_${base}_${num}`;
}

export async function migrateCreatorNamesToGhost() {
  console.log("👻 Starting creatorName migration...");

  const snap = await getDocs(collection(db, "projects"));

  let updated = 0;
  let skipped = 0;

  for (const d of snap.docs) {
    const data: any = d.data();
    const projectId = d.id;

    const creatorEmail = (data.creatorEmail || "").toLowerCase();

    // if no email, fallback
    const ghostHandle = creatorEmail
      ? handleFromEmail(creatorEmail)
      : "Anonymous Ghost 👻";

    try {
      await updateDoc(doc(db, "projects", projectId), {
        creatorName: ghostHandle,
      });

      console.log(`✅ Updated ${projectId} → ${ghostHandle}`);
      updated++;
    } catch (err) {
      console.error("❌ Failed update:", projectId, err);
      skipped++;
    }
  }

  console.log("👻 Migration done:", { updated, skipped });
  return { updated, skipped };
}
s