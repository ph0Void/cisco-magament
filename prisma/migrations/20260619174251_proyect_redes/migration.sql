-- CreateTable
CREATE TABLE "ClientTopology" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "topologyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientTopology_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClientTopology_topologyId_fkey" FOREIGN KEY ("topologyId") REFERENCES "Topology" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
