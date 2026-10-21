import Image from "next/image";

/**
 * Brief brand reveal on the first page load of a session. It is pure CSS:
 * the page renders underneath immediately, the overlay never blocks input
 * (pointer-events: none), it fades out after ~1s regardless of JavaScript,
 * and it is skipped entirely for reduced-motion users and on later visits.
 */
export const PRELOADER_SCRIPT = `try{if(sessionStorage.getItem("sb-seen")){document.documentElement.classList.add("sb-seen")}else{sessionStorage.setItem("sb-seen","1")}}catch(e){}`;

export function Preloader() {
  return (
    <div className="preloader" aria-hidden="true">
      <div className="preloader-mark flex flex-col items-center gap-5">
        <Image src="/brand/safe-bharat-emblem.png" alt="" width={320} height={381} priority className="h-24 w-auto" />
        <Image src="/brand/safe-bharat-wordmark.png" alt="" width={720} height={136} priority className="h-8 w-auto" />
        <span className="block h-1 w-40 overflow-hidden rounded-full bg-mist">
          <span className="preloader-bar block h-full w-full rounded-full bg-brand-red" />
        </span>
      </div>
    </div>
  );
}
