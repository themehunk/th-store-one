import { __ } from "@wordpress/i18n";
import OpacityControl from "@th-storeone-control/OpacityControl";
import RotationControl from "@th-storeone-control/RotationControl";
import FlipControl from "@th-storeone-control/FlipControl";
import UniversalDimensionControl from "@th-storeone-control/UniversalDimensionControl";
import PositionControl from "@th-storeone-control/PositionControl";

import UniversalBorderControl from "@th-storeone-control/UniversalBorderControl";
export default function TrustBadgeStyleControl({ value = {}, badgeType, onChange }) {
  const update = (key, val) => {
    onChange({
      ...value,
      [key]: val,
    });
  };
  
  return (
    <>
      {/* Opacity */}
      <OpacityControl
        value={value?.transform?.opacity ?? "100"}
        label={__("Badge Opacity")}
        description={__("Control the badge transparency")}
        onChange={(v) =>
          update("transform", {
            ...value?.transform,
            opacity: v,
          })
        }
      />
      {/* Rotation */}
      <RotationControl
        value={{
          rotateX: value?.transform?.rotateX,
          rotateY: value?.transform?.rotateY,
          rotateZ: value?.transform?.rotateZ,
        }}
        label={__("Badge Rotation")}
        description={__("Rotate the badge in 3D space")}
        onChange={(v) => {
          update("transform", {
            ...value?.transform,
            rotateX: v.rotateX,
            rotateY: v.rotateY,
            rotateZ: v.rotateZ,
          });
        }}
      />
    
      {badgeType !== "badges_images" && (
      <FlipControl value={value.flip} onChange={(v) => update("flip", v)} />
      )}

      <PositionControl
        value={value?.position || {}}
        onChange={(v) => update("position", v)}
      />

      <UniversalDimensionControl
        label="Margin"
        value={value?.margin}
        responsive={false}
        onChange={(v) => update("margin", v)}
      />
     {["badges_text", "badges_css"].includes(badgeType) && (
      <UniversalDimensionControl
        label="Padding"
        value={value?.padding}
        responsive={false}
        onChange={(v) => update("padding", v)}
      />
      )}
      {["badges_text", "badges_css"].includes(badgeType) && (
      <UniversalBorderControl
        value={value?.border}
        onChange={(v) => update("border", v)}
      />
    )}
    </>
  );
}