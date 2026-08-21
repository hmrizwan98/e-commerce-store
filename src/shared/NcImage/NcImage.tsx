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

  return (
    <div className={containerClassName}>
      {isFillMode ? (
        <Image className={className} alt={alt} fill {...args} />
      ) : (
        <Image className={className} alt={alt} width={width} height={height} {...args} />
      )}
    </div>
  );
};

export default NcImage;
