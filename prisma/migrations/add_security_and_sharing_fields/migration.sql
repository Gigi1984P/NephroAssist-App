-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "retention_until" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "previous_hash" TEXT,
ADD COLUMN     "row_hash" TEXT,
ADD COLUMN     "user_agent" TEXT;

-- AlterTable
ALTER TABLE "blockers" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "retention_until" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "kms_key_id" TEXT,
ADD COLUMN     "retention_until" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "help_requests" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "retention_until" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "retention_until" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "patient_cases" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "retention_until" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "patient_requirements" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "retention_until" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "gdpr_consent_granted_at" TIMESTAMP(3),
ADD COLUMN     "gdpr_consent_revoked_at" TIMESTAMP(3),
ADD COLUMN     "gdpr_data_portability_at" TIMESTAMP(3),
ADD COLUMN     "retention_until" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "retention_until" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "data_sharing_permissions" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "donor_organization_id" TEXT NOT NULL,
    "recipient_organization_id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "granted_by" TEXT NOT NULL,

    CONSTRAINT "data_sharing_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "data_sharing_permissions_patient_id_idx" ON "data_sharing_permissions"("patient_id");

-- CreateIndex
CREATE INDEX "data_sharing_permissions_recipient_organization_id_idx" ON "data_sharing_permissions"("recipient_organization_id");

-- CreateIndex
CREATE INDEX "data_sharing_permissions_expires_at_idx" ON "data_sharing_permissions"("expires_at");

-- CreateIndex
CREATE INDEX "documents_document_date_idx" ON "documents"("document_date");

-- CreateIndex
CREATE INDEX "patient_requirements_listing_blocker_status_idx" ON "patient_requirements"("listing_blocker", "status");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_parent_organization_id_fkey" FOREIGN KEY ("parent_organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_previous_version_id_fkey" FOREIGN KEY ("previous_version_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_sharing_permissions" ADD CONSTRAINT "data_sharing_permissions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_sharing_permissions" ADD CONSTRAINT "data_sharing_permissions_donor_organization_id_fkey" FOREIGN KEY ("donor_organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_sharing_permissions" ADD CONSTRAINT "data_sharing_permissions_recipient_organization_id_fkey" FOREIGN KEY ("recipient_organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_sharing_permissions" ADD CONSTRAINT "data_sharing_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
