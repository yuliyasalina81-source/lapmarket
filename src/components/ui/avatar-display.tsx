/** Server Component */
/** Аватар пользователя: URL или инициалы */

import Image from "next/image";
import { isImageUrl } from "@/lib/constants";

/**
 * Круглый аватар из картинки или букв имени
 */
export function AvatarDisplay({
  avatar,
  name,
  size = 40,
  className = "",
}: {
  avatar: string;
  name: string;
  size?: number;
  className?: string;
}) {
  if (isImageUrl(avatar)) {
    return (
      <Image
        src={avatar}
        alt={name}
        width={size}
        height={size}
        className={`rounded-2xl object-cover ${className}`}
      />
    );
  }
  return (
    <span
      className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-emerald-50 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {avatar}
    </span>
  );
}
