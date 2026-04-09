import { Button, ButtonGroup } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import UniversalRangeControl from "@th-storeone-global/UniversalRangeControl";
import { S1Field,S1FieldGroup } from "@th-storeone-global/S1Field";

export default function PositionControl({ value = {}, onChange }) {

const update = (key,val)=>{
    onChange({
        ...value,
        [key]:val
    });
};

const mode = value?.mode || "custom";
const anchor = value?.anchor || "top-left";
const position = value?.position || "top";

return(
<S1FieldGroup title={__("Position Mode",'th-store-one')}>
<div className="s1-position-control">

{/* MODE */}

<S1Field>

<ButtonGroup className="s1-posiiton-btn">

<Button
isPressed={mode==="custom"}
onClick={()=>update("mode","custom")}
>
In Px / %
</Button>

<Button
isPressed={mode==="fixed"}
onClick={()=>update("mode","fixed")}
>
Fixed
</Button>

</ButtonGroup>

</S1Field>


{/* CUSTOM MODE */}

{mode==="custom" && (

<>

<S1Field
label={__("Anchor Point",'th-store-one')}
description={__("Set the badge anchor point.", 'th-store-one')}
>

<div className="s1-anchor-grid">

<Button
className="s1-anchor-card"
isPressed={anchor==="top-left"}
onClick={()=>update("anchor","top-left")}
>
<div className="anchor-preview tl"></div>
<span>TOP LEFT</span>
</Button>

<Button
className="s1-anchor-card"
isPressed={anchor==="top-right"}
onClick={()=>update("anchor","top-right")}
>
<div className="anchor-preview tr"></div>
<span>TOP RIGHT</span>
</Button>

<Button
className="s1-anchor-card"
isPressed={anchor==="bottom-left"}
onClick={()=>update("anchor","bottom-left")}
>
<div className="anchor-preview bl"></div>
<span>BOTTOM LEFT</span>
</Button>

<Button
className="s1-anchor-card"
isPressed={anchor==="bottom-right"}
onClick={()=>update("anchor","bottom-right")}
>
<div className="anchor-preview br"></div>
<span>BOTTOM RIGHT</span>
</Button>

</div>

</S1Field>


{/* OFFSET CONTROLS */}

{anchor.includes("top") && (

<UniversalRangeControl
label="Top"
value={value.top}
onChange={(v)=>update("top",v)}
units={['px', '%']}
/>
)}

{anchor.includes("bottom") && (

<UniversalRangeControl
label="Bottom"
value={value.bottom}
onChange={(v)=>update("bottom",v)}
units={['px', '%']}
/>

)}

{anchor.includes("left") && (

<UniversalRangeControl
label="Left"
value={value.left}
onChange={(v)=>update("left",v)}
units={['px', '%']}
/>

)}

{anchor.includes("right") && (

<UniversalRangeControl
label="Right"
value={value.right}
onChange={(v)=>update("right",v)}
units={['px', '%']}
/>

)}

</>

)}


{/* FIXED MODE */}

{mode==="fixed" && (

<>

<S1Field label={__("Position","th-store-one")}>

<div className="s1-position-grid">

<Button
className="s1-pos-card"
isPressed={position==="top"}
onClick={()=>update("position","top")}
>

<div className="preview preview-top"></div>
<span>TOP</span>

</Button>

<Button
className="s1-pos-card"
isPressed={position==="middle"}
onClick={()=>update("position","middle")}
>

<div className="preview preview-middle"></div>
<span>MIDDLE</span>

</Button>

<Button
className="s1-pos-card"
isPressed={position==="bottom"}
onClick={()=>update("position","bottom")}
>

<div className="preview preview-bottom"></div>
<span>BOTTOM</span>

</Button>

</div>

</S1Field>


<S1Field label={__("Alignment","th-store-one")}>

<div className="s1-position-grid">

<Button
className="s1-pos-card"
isPressed={value.align==="left"}
onClick={()=>update("align","left")}
>

<div className={`preview preview-left ${position}`}></div>
<span>LEFT</span>

</Button>

<Button
className="s1-pos-card"
isPressed={value.align==="center"}
onClick={()=>update("align","center")}
>

<div className={`preview preview-center ${position}`}></div>
<span>CENTER</span>

</Button>

<Button
className="s1-pos-card"
isPressed={value.align==="right"}
onClick={()=>update("align","right")}
>

<div className={`preview preview-right ${position}`}></div>
<span>RIGHT</span>

</Button>

</div>

</S1Field>

</>

)}

</div>
</S1FieldGroup>

);

}