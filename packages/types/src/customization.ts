// ─────────────────────────────────────────────────────────
// @bingooo/types — Customization and Design JSON
// ─────────────────────────────────────────────────────────

/** Customization moderation status from doc 09 */
export type CustomizationStatus =
  | 'uploaded'
  | 'processing'
  | 'needs_review'
  | 'approved'
  | 'rejected'
  | 'ready_for_print';

/** Layer types in the design canvas */
export type LayerType = 'image' | 'text';

/** A single layer on the design canvas */
export interface DesignLayer {
  type: LayerType;
  /** Asset ID for image layers */
  assetId?: string;
  /** Text content for text layers */
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  x: number;
  y: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
}

/** The design JSON stored in the customization record — doc 07 */
export interface DesignJSON {
  version: number;
  productId: string;
  templateId: string;
  canvas: {
    width: number;
    height: number;
  };
  layers: DesignLayer[];
}

export interface Customization {
  id: string;
  userId: string;
  productId: string;
  status: CustomizationStatus;
  designJson: DesignJSON | null;
  previewKey: string | null;
  printFileKey: string | null;
  createdAt: string;
  updatedAt: string;
  previewUrl?: string;
}

export interface CustomizationAsset {
  id: string;
  customizationId: string;
  objectKey: string;
  assetType: 'upload' | 'preview' | 'print';
  metadataJson: Record<string, unknown> | null;
}

export interface CreateCustomizationInput {
  productId: string;
  templateId?: string;
}

export interface SaveDesignInput {
  designJson: DesignJSON;
}

/** Presigned upload request */
export interface PresignUploadRequest {
  filename: string;
  contentType: string;
  sizeBytes: number;
  purpose: 'customization' | 'product' | 'avatar';
}

/** Presigned upload response */
export interface PresignUploadResponse {
  uploadUrl: string;
  objectKey: string;
  expiresAt: string;
}
