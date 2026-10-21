import { Suspense } from "react";
import { equipment, equipmentCategories } from "@/content/equipment";
import { EquipmentCard } from "@/components/cards/cards";
import { EquipmentCatalogue } from "@/components/sections/equipment-catalogue";
import { CTASection, PageHero } from "@/components/sections/sections";
import { Container, Section } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Fire Safety Equipment Catalogue",
  description:
    "Fire extinguishers, fire alarm equipment, hydrant and hose equipment, sprinkler components, fire pumps, signage and PPE. Enquire for a quotation.",
  path: "/equipment",
});

/** Server-rendered list shown until the interactive catalogue hydrates. */
function StaticCatalogue() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {equipment.map((item) => (
        <li key={item.slug}>
          <EquipmentCard item={item} headingLevel="h2" />
        </li>
      ))}
    </ul>
  );
}

export default function EquipmentPage() {
  return (
    <>
      <PageHero
        eyebrow="Equipment"
        title="Fire & safety equipment"
        intro="Equipment selected for the application and supplied with installation and servicing support. Makes, ratings and prices are confirmed in our quotation for your requirement."
        breadcrumbs={[{ label: "Equipment", href: "/equipment" }]}
      />
      <Section>
        <Container>
          <Suspense fallback={<StaticCatalogue />}>
            <EquipmentCatalogue items={equipment} categories={equipmentCategories} />
          </Suspense>
        </Container>
      </Section>
      <CTASection
        title="Need equipment for a project?"
        description="Send us your list, specification or approved make list and we will prepare a quotation."
        primary={{ label: "Request a Quote", href: "/request-a-quote?service=fire-safety-equipment-supply" }}
        secondary={{ label: "Contact our team", href: "/contact" }}
      />
    </>
  );
}
