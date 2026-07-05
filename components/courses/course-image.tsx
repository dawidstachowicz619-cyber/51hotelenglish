import Image from "next/image";

import { cn } from "@/lib/utils";

type CourseImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function CourseImage({
  src,
  alt,
  className,
  priority = false,
}: CourseImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border-2 border-border bg-muted",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 400px"
        priority={priority}
      />
    </div>
  );
}
