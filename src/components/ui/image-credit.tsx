import type { ImageCredit } from "@/content/images";

/** Attribution in the form Creative Commons asks for: author, source, licence and changes. */
export function ImageCreditLine({ credit }: { credit: ImageCredit }) {
  return (
    <span>
      Photo:{" "}
      <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-navy-900">
        {credit.author}
        <span className="sr-only"> (opens Wikimedia Commons in a new tab)</span>
      </a>
      ,{" "}
      {credit.licenseUrl ? (
        <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer license" className="underline underline-offset-2 hover:text-navy-900">
          {credit.license}
        </a>
      ) : (
        credit.license
      )}
      , {credit.changes}.
    </span>
  );
}
