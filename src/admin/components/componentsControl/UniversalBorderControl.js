import { SelectControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

import UniversalDimensionControl from "@storeone-control/UniversalDimensionControl";
import THBackgroundControl from "@storeone-control/color";

import { S1Field, S1FieldGroup } from "@storeone-global/S1Field";

export default function UniversalBorderControl({ value = {}, onChange }) {

  const border = value || {};

  const update = (key, val) => {
    onChange({
      ...border,
      [key]: val,
    });
  };

  return (
    <S1FieldGroup title={__("Border", "store-one")}>
      {/* Border Style */}
      <S1Field label={__("Border Style", "store-one")}>
        <SelectControl
          value={border?.style || "solid"}
          options={[
            { label: "None", value: "none" },
            { label: "Solid", value: "solid" },
            { label: "Dashed", value: "dashed" },
            { label: "Dotted", value: "dotted" },
            { label: "Double", value: "double" },
          ]}
          onChange={(v) => update("style", v)}
        />
      </S1Field>
      {/* Border Color */}
      <S1Field>
        <THBackgroundControl
        label={__("Border Color", "store-one")}
          allowGradient={false}
          value={border?.color || "#000000"}
          onChange={(v) => update("color", v)}
        />
      </S1Field>
       {/* Border Width */}
      <UniversalDimensionControl
        label={__("Border Width", "store-one")}
        value={border?.width}
        responsive={false}
        onChange={(v) => update("width", v)}
      />
       {/* Border Radius */}
      <UniversalDimensionControl
        label={__("Border Radius", "store-one")}
        value={border?.radius}
        responsive={false}
        onChange={(v) => update("radius", v)}
      />

    </S1FieldGroup>
  );
}