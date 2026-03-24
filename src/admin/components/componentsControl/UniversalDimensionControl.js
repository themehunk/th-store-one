/**
 * ---------------------------------------------------------
 * UNIVERSAL DIMENSION CONTROL – StoreOne UI
 * ---------------------------------------------------------
 *
 * A reusable spacing control built on top of WordPress
 * `__experimentalBoxControl`.
 *
 * This control is designed for StoreOne admin UI and can
 * be used for:
 *
 * ✓ Margin
 * ✓ Padding
 * ✓ Position offsets
 * ✓ Top / Bottom spacing
 * ✓ Left / Right spacing
 *
 * ---------------------------------------------------------
 * IMPORTANT NOTE
 * ---------------------------------------------------------
 *
 * WordPress BoxControl DOES NOT support unit selector.
 * Units must be stored directly in the value string.
 *
 * Example:
 *
 *   top: "10px"
 *   left: "5%"
 *
 * ---------------------------------------------------------
 * PROPS
 * ---------------------------------------------------------
 *
 * label        string
 *   → Field label shown above the control.
 *
 * description  string
 *   → Optional help text displayed under the label.
 *
 * value        object
 *   → Current dimension values.
 *
 * onChange     function
 *   → Callback when values change.
 *
 * responsive   boolean
 *   → Enable responsive mode (Desktop / Tablet / Mobile).
 *
 * sides        array
 *   → Which sides should be used.
 *
 *   Default:
 *
 *     ["top","right","bottom","left"]
 *
 *   Examples:
 *
 *     ["top","bottom"]
 *     ["left","right"]
 *     ["top","left"]
 *
 * ---------------------------------------------------------
 * VALUE STRUCTURE
 * ---------------------------------------------------------
 *
 * Non-responsive value:
 *
 *   margin: {
 *      top: "10px",
 *      right: "10px",
 *      bottom: "10px",
 *      left: "10px"
 *   }
 *
 *
 * Responsive value:
 *
 *   margin: {
 *      Desktop: {
 *         top: "20px",
 *         bottom: "20px"
 *      },
 *      Tablet: {
 *         top: "15px"
 *      },
 *      Mobile: {
 *         top: "10px"
 *      }
 *   }
 *
 * ---------------------------------------------------------
 * USAGE EXAMPLES
 * ---------------------------------------------------------
 *
 * Margin Control
 *
 * <UniversalDimensionControl
 *     label="Margin"
 *     description="Set margin for all sides."
 *     value={settings.margin}
 *     responsive={true}
 *     onChange={(v)=>updateSetting("margin",v)}
 * />
 *
 *
 * Padding Control
 *
 * <UniversalDimensionControl
 *     label="Padding"
 *     value={settings.padding}
 *     responsive={true}
 *     onChange={(v)=>updateSetting("padding",v)}
 * />
 *
 *
 * Vertical Spacing Only
 *
 * <UniversalDimensionControl
 *     label="Vertical Margin"
 *     sides={["top","bottom"]}
 *     value={settings.margin}
 *     onChange={(v)=>updateSetting("margin",v)}
 * />
 *
 *
 * Position Offset
 *
 * <UniversalDimensionControl
 *     label="Offset"
 *     sides={["top","left"]}
 *     value={settings.offset}
 *     onChange={(v)=>updateSetting("offset",v)}
 * />
 *
 * ---------------------------------------------------------
 * TIPS
 * ---------------------------------------------------------
 *
 * ✔ Use responsive={true} to enable device controls.
 * ✔ Use sides=[] to limit which directions appear.
 * ✔ Store units directly inside values ("10px", "5%").
 *
 * ---------------------------------------------------------
 */

import {
    __experimentalBoxControl as BoxControl,
    BaseControl
} from "@wordpress/components";

import DeviceControl from "@th-storeone-global/DeviceControl";
import useDeviceStore from "@th-storeone/store/device-store";

export default function UniversalDimensionControl({

    label = "Dimension",
    description = "",
    value = {},
    onChange,

    responsive = false,
    sides = ["top","right","bottom","left"]

}){

    const device = useDeviceStore((s)=>s.device);

    const current = responsive
        ? (value?.[device] ?? {})
        : (value ?? {});

    /**
     * Filter sides for UI
     */
    const filteredValues = {};

    sides.forEach((side)=>{
        filteredValues[side] = current?.[side] ?? "";
    });

    /**
     * Handle update
     */
    const update = (newValues)=>{

        const merged = {
            ...current,
            ...newValues
        };

        if(responsive){

            onChange({
                ...value,
                [device]: merged
            });

        }else{

            onChange(merged);

        }

    };

    return (

        <BaseControl
            label={responsive ? `${label} (${device})` : label}
            help={description}
        >

            {responsive && <DeviceControl />}

            <BoxControl
            label={false}
                values={filteredValues}
                onChange={update}
            />

        </BaseControl>

    );

}