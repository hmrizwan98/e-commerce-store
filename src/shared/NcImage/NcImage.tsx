import React, { FC } from "react";
import Image, { ImageProps } from "next/image";

export interface NcImageProps extends Omit<ImageProps, "alt"> {
  containerClassName?: string;
  alt?: string;
}

const NcImage: FC<NcImageProps> = ({
  containerClassName = "",
  alt = "nc-image",
  className = "object-cover w-full h-full",
  fill,
  width,
  height,
  ...args
}) => {
  const isFillMode = Boolean(fill || (!width && !height));

  const defaultSizes = args.sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

  return (
    <div className={containerClassName}>
      {isFillMode ? (
        <Image className={className} alt={alt} fill sizes={defaultSizes} {...args} />
      ) : (
        <Image className={className} alt={alt} width={width} height={height} sizes={defaultSizes} {...args} />
      )}
    </div>
  );
};

export default NcImage;
