-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "topologyId" TEXT NOT NULL,
    "userId" TEXT,
    CONSTRAINT "Alert_topologyId_fkey" FOREIGN KEY ("topologyId") REFERENCES "Topology" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Alert" ("createdAt", "description", "id", "resolved", "severity", "title", "topologyId", "userId") SELECT "createdAt", "description", "id", "resolved", "severity", "title", "topologyId", "userId" FROM "Alert";
DROP TABLE "Alert";
ALTER TABLE "new_Alert" RENAME TO "Alert";
CREATE TABLE "new_Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "topologyId" TEXT NOT NULL,
    CONSTRAINT "Log_topologyId_fkey" FOREIGN KEY ("topologyId") REFERENCES "Topology" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Log" ("content", "createdAt", "id", "level", "title", "topologyId") SELECT "content", "createdAt", "id", "level", "title", "topologyId" FROM "Log";
DROP TABLE "Log";
ALTER TABLE "new_Log" RENAME TO "Log";
CREATE TABLE "new_Topology" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "packetTracerFile" TEXT,
    "topologyJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Topology_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Topology" ("createdAt", "description", "id", "name", "ownerId", "packetTracerFile", "topologyJson", "updatedAt") SELECT "createdAt", "description", "id", "name", "ownerId", "packetTracerFile", "topologyJson", "updatedAt" FROM "Topology";
DROP TABLE "Topology";
ALTER TABLE "new_Topology" RENAME TO "Topology";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
