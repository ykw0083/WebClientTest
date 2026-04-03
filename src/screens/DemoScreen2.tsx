import { useState } from "react";
import { Button, FlexBox, Input, Label } from "@ui5/webcomponents-react";
import { ChooseFromList } from "../components";
import { useItemMaster } from "../hooks";
import type { ItemMaster } from "../api";
import { useBusinessPartner } from "../hooks";
import type { BusinessPartner } from "../api";

export const DemoScreen2: React.FC = () => {
  // ========== STATE
  const [cflOpen, setCflOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<BusinessPartner | null>(null);

  // ========== HOOKS
  const { data, isPending } = useBusinessPartner({ page, search });

  // ========== VIEWS
  return (
    <FlexBox direction="Column" style={{ padding: "1rem", gap: "1rem" }}>
      <FlexBox alignItems="Center" style={{ gap: "0.5rem" }}>
        <Label>BP Code</Label>
        <Input value={selectedItem?.CardCode ?? ""} readonly />
        <Button onClick={() => setCflOpen(true)}>...</Button>
      </FlexBox>

      <FlexBox alignItems="Center" style={{ gap: "0.5rem" }}>
        <Label>BP Name</Label>
        <Input value={selectedItem?.CardName ?? ""} readonly />
      </FlexBox>

      <ChooseFromList<BusinessPartner>
        open={cflOpen}
        title="Select Item"
        columns={[
          { key: "CardCode", label: "BP Code" },
          { key: "CardName", label: "BP Name" },
        ]}
        data={data?.value ?? []}
        totalCount={data?.count ?? 0}
        isLoading={isPending}
        page={page}
        search={search}
        onPageChange={setPage}
        onSearchChange={setSearch}
        onSelect={setSelectedItem}
        onClose={() => setCflOpen(false)}
      />
    </FlexBox>
  );
};
