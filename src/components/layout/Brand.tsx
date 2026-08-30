import Link from "next/link";
import Image from "next/image";

export function Brand({
  destination = "/",
  inverse = false,
}: {
  destination?: string;
  inverse?: boolean;
}) {
  return (
    <Link
      href={destination}
      className="flex items-center gap-3"
      aria-label="Harborview Family Health Centre home"
    >
      <Image
        src="/images/harborview-mark.png"
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 object-contain"
        priority
      />
      <span>
        <strong
          className={`block font-serif text-xl leading-none tracking-tight ${inverse ? "text-white" : "text-[#102b3d]"}`}
        >
          Harborview
        </strong>
        <span
          className={`mt-1 block text-[10px] font-bold tracking-[.2em] ${inverse ? "text-[#a9d9cf]" : "text-[#277579]"}`}
        >
          FAMILY HEALTH CENTRE
        </span>
      </span>
    </Link>
  );
}
