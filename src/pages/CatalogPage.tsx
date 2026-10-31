import { PageHeader } from "@/components/ui/PageHeader";
import { CatalogBrowser } from "@/features/catalog/CatalogBrowser";

export default function CatalogPage() {
  return (
    <>
      <PageHeader title="Catalog" description="Browse every steelbook and game edition." />
      <CatalogBrowser source="catalog" />
    </>
  );
}
