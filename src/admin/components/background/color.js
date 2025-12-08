import {
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

import {
    ColorPicker,
    GradientPicker,
    Button,
    ColorPalette,
    Popover,
    ColorIndicator
} from '@wordpress/components';

import {
  __experimentalToolsPanel as ToolsPanel,
  __experimentalToolsPanelItem as ToolsPanelItem,
  __experimentalUnitControl as UnitControl
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { useState,useRef } from '@wordpress/element';
import './style.css';
const gradients = [
    { name: 'Purple to Blue', gradient: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' },
    { name: 'Red to Yellow', gradient: 'linear-gradient(135deg,#f85032 0%,#e73827 100%)' },
    { name: 'Green to Cyan', gradient: 'linear-gradient(135deg,#11998e 0%,#38ef7d 100%)' },
];
//  <THBackgroundControl />
export default function THBackgroundControl({
  allowGradient=true,
  label=__('Background color', 'store-one'),
  value="",
  onChange
}) {

console.log(value);

       const [open, setOpen] = useState(false);
    const [mode, setMode] = useState("color");
    const [color, setColor] = useState(value);
    const [gradient, setGradient] = useState(value);
 const ref = useRef();
   const colors = [
    { name: 'red', color: '#f00' },
    { name: 'white', color: '#fff' },
    { name: 'blue', color: '#00f' },
  ];

  const gradientColor = [{
          gradient: 'linear-gradient(135deg,rgba(6,147,227,1) 0%,rgb(155,81,224) 100%)',
          name: 'Vivid cyan blue to vivid purple',
          slug: 'vivid-cyan-blue-to-vivid-purple'
        },
        {
          gradient: 'linear-gradient(135deg,rgb(122,220,180) 0%,rgb(0,208,130) 100%)',
          name: 'Light green cyan to vivid green cyan',
          slug: 'light-green-cyan-to-vivid-green-cyan'
        },
        {
          gradient: 'linear-gradient(135deg,rgba(252,185,0,1) 0%,rgba(255,105,0,1) 100%)',
          name: 'Luminous vivid amber to luminous vivid orange',
          slug: 'luminous-vivid-amber-to-luminous-vivid-orange'
        },
        {
          gradient: 'linear-gradient(135deg,rgba(255,105,0,1) 0%,rgb(207,46,46) 100%)',
          name: 'Luminous vivid orange to vivid red',
          slug: 'luminous-vivid-orange-to-vivid-red'
        },
        {
          gradient: 'linear-gradient(135deg,rgb(238,238,238) 0%,rgb(169,184,195) 100%)',
          name: 'Very light gray to cyan bluish gray',
          slug: 'very-light-gray-to-cyan-bluish-gray'
        },
        {
          gradient: 'linear-gradient(135deg,rgb(74,234,220) 0%,rgb(151,120,209) 20%,rgb(207,42,186) 40%,rgb(238,44,130) 60%,rgb(251,105,98) 80%,rgb(254,248,76) 100%)',
          name: 'Cool to warm spectrum',
          slug: 'cool-to-warm-spectrum'
        },
        {
          gradient: 'linear-gradient(135deg,hsl(200, 100%, 50%) 0%,hsl(280, 100%, 60%) 100%)',
          name: 'HSL blue to purple',
          slug: 'hsl-blue-to-purple'
        },
        {
          gradient: 'linear-gradient(135deg,hsla(120, 100%, 40%, 0.85) 0%,hsla(0, 100%, 50%, 0.85) 100%)',
          name: 'HSLA green to red',
          slug: 'hsla-green-to-red'
        }];

    const normalizeColor = (v) => {
        if (!v) return "#000"; // ⭐ default fallback

        if (typeof v === "string") return v;

        if (v?.rgb) {
            const { r, g, b, a = 1 } = v.rgb;
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }

        return "#000";
    };

  // const colorValue = normalizeColor(value);

    return (
        <div className="th-bg-control">
          <div class="s1-field-label">{label}</div>
              <div className="s1-color-panel">
                <div className='color-box-wrap' >
                <div className='color-box' style={{ background: value }} ref={ref} onClick={() => setOpen(true)}></div>
                <div className="color-input-wrap">
                <input class="color-input" type="text" value={value} />
                <ColorIndicator colorValue={ value } />
                </div> 
                </div>
              </div>


             {open && (
                    <Popover
                        anchor={ref.current}
                        onClose={() => setOpen(false)}
                    >

                       {allowGradient &&<ToggleGroupControl
                        __next40pxDefaultSize
                      __nextHasNoMarginBottom
                      isBlock
                label="Color Type"
                value={mode}
                onChange={(selected) => setMode(selected)}
            >
                 <ToggleGroupControlOption value="color" label="Color" />
               <ToggleGroupControlOption value="gradient" label="Gradient" />
              </ToggleGroupControl>}

                    <div style={{ marginTop: "10px" }}>

                                {mode === "color" && ( <ColorPalette
                                  colors={ colors }
                                  value={ value }
                                  onChange={ ( color ) => onChange( color ) }
                              />)}

                              {mode==='gradient'&& <GradientPicker
                                gradients={[
                                  {
                                    gradients: gradientColor,
                                    name: 'Gradient Color'
                                  }
                                ]}
                              value={ value }
                                onChange={ ( color ) => onChange( color ) }
                              />}


                        </div>
                    </Popover>
            )}

             
        
</div>
       
    );
}
