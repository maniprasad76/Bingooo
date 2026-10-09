import type { ImgHTMLAttributes } from 'react';
import { imageSrcSet, type ImageAsset } from '../../lib/images';

export interface PictureProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  image: ImageAsset;
  /** Rendered width (the <img> `sizes` attribute). Leave out for single-size assets such as icons. */
  sizes?: string;
}

/**
 * Responsive <img> served as AVIF/WebP with a fallback. The <picture> wrapper
 * uses display: contents, so the <img> lays out exactly as it would on its
 * own. Images load lazily unless `loading="eager"` is passed (above the fold).
 */
export function Picture({ image, sizes, loading = 'lazy', decoding = 'async', alt = '', ...img }: PictureProps) {
  return (
    <picture style={{ display: 'contents' }}>
      {image.formats.map((format) => (
        <source key={format} type={`image/${format}`} srcSet={imageSrcSet(image, format)} sizes={sizes} />
      ))}
      <img
        src={image.fallback}
        width={image.width}
        height={image.height}
        loading={loading}
        decoding={decoding}
        alt={alt}
        {...img}
      />
    </picture>
  );
}
