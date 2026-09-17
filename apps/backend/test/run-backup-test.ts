import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { db, saveDb } from '../src/common/database/store';
import { backupService } from '../src/common/services/backup.service';
import { getProductBySlug } from '../src/common/database/db-index.service';

async function runBackupTest() {
  console.log('\n======================================================');
  console.log('💾 BINGOOO BACKUP & RESTORE VERIFICATION TEST');
  console.log('======================================================\n');

  let passed = true;

  try {
    const initialProductCount = db.products?.length || 0;
    console.log(`[Step 1] Initial database state: ${initialProductCount} products.`);

    // 1. Create a backup
    console.log('[Step 2] Creating test backup snapshot...');
    const backup = backupService.createBackup('automated-test');
    console.log(`  Backup created: ${backup.id} (${backup.filename}, ${backup.sizeBytes} bytes)`);

    if (!backup.id || backup.sizeBytes <= 0) {
      console.error('❌ [FAIL] Backup creation returned invalid info');
      passed = false;
    } else {
      console.log('✅ [PASS] Backup file created with valid metadata');
    }

    // 2. Modify database (inject dummy test product)
    console.log('[Step 3] Simulating accidental data modification (adding test product)...');
    const dummyId = `temp-test-${Date.now()}`;
    db.products.push({
      id: dummyId,
      name: 'Temp Corrupt Product',
      slug: 'temp-corrupt-product',
      description: 'To be restored away',
      price: 9999,
      categoryId: 'c1',
      isActive: true,
      tags: ['corrupt'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any);
    saveDb();

    console.log(`  Current product count after modification: ${db.products.length}`);
    if (db.products.length !== initialProductCount + 1) {
      console.error('❌ [FAIL] Product injection failed');
      passed = false;
    }

    // 3. Restore from backup
    console.log(`[Step 4] Restoring database from backup ${backup.id}...`);
    const restoreResult = backupService.restoreBackup(backup.id);
    console.log(`  Restore status:`, restoreResult);

    // 4. Verify restoration
    console.log('[Step 5] Verifying database integrity after restore...');
    if (db.products.length === initialProductCount) {
      console.log(`✅ [PASS] Product count restored exactly to ${initialProductCount}`);
    } else {
      console.error(`❌ [FAIL] Expected ${initialProductCount} products, got ${db.products.length}`);
      passed = false;
    }

    const dummyCheck = db.products.find((p) => p.id === dummyId);
    if (!dummyCheck) {
      console.log('✅ [PASS] Temporary injected product was successfully purged by restore');
    } else {
      console.error('❌ [FAIL] Temporary product still exists after restore');
      passed = false;
    }

    // 5. Verify index rebuild after restore
    const firstProduct = db.products[0];
    if (firstProduct) {
      const indexed = getProductBySlug(firstProduct.slug);
      if (indexed && indexed.id === firstProduct.id) {
        console.log(`✅ [PASS] In-memory indexes verified operational after restore (${firstProduct.slug})`);
      } else {
        console.error('❌ [FAIL] In-memory index failed to resolve restored product');
        passed = false;
      }
    }

    // 6. Verify backup rotation (max 10)
    console.log('[Step 6] Testing backup rotation limit (max 10 backups)...');
    for (let i = 0; i < 12; i++) {
      backupService.createBackup(`rotation-${i}`);
    }
    const backupsList = backupService.listBackups();
    console.log(`  Current total backups in directory: ${backupsList.length}`);
    if (backupsList.length <= 10) {
      console.log(`✅ [PASS] Auto-rotation successfully capped backups at ${backupsList.length} <= 10`);
    } else {
      console.error(`❌ [FAIL] Rotation exceeded 10 backups limit: ${backupsList.length}`);
      passed = false;
    }

    console.log('\n======================================================');
    if (passed) {
      console.log('🎉 BACKUP & RESTORE TEST COMPLETED SUCCESSFULLY');
    } else {
      console.error('💥 BACKUP & RESTORE TEST DETECTED ISSUES');
    }
    console.log('======================================================\n');
  } catch (err) {
    console.error('Fatal backup test error:', err);
    process.exit(1);
  }
}

runBackupTest();
