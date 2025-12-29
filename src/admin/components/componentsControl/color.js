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

// console.log(value);

       const [open, setOpen] = useState(false);
    const [mode, setMode] = useState("color");
 const ref = useRef();
   const colors = [
        {
          "slug": "black",
          "name": "Black",
          "color": "#000000"
        },
        {
          "slug": "white",
          "name": "White",
          "color": "#ffffff"
        },
        {
          "slug": "gray",
          "name": "Gray",
          "color": "#abb8c3"
        },
        {
          "slug": "blue",
          "name": "Blue",
          "color": "#0073aa"
        },
        {
          "slug": "dark-blue",
          "name": "Dark Blue",
          "color": "#005177"
        },
        {
          "slug": "light-blue",
          "name": "Light Blue",
          "color": "#229fd8"
        },
        {
          "slug": "red",
          "name": "Red",
          "color": "#d63638"
        },
        {
          "slug": "orange",
          "name": "Orange",
          "color": "#f56e28"
        },
        {
          "slug": "green",
          "name": "Green",
          "color": "#46b450"
        },
        {
          "slug": "purple",
          "name": "Purple",
          "color": "#9b51e0"
        }
      ];

  const gradientColor = [
        {
          "slug": "vivid-cyan-blue-to-vivid-purple",
          "name": "Vivid cyan blue to vivid purple",
          "gradient": "linear-gradient(135deg, rgb(6,147,227) 0%, rgb(155,81,224) 100%)"
        },
        {
          "slug": "light-green-cyan-to-vivid-green-cyan",
          "name": "Light green cyan to vivid green cyan",
          "gradient": "linear-gradient(135deg, rgb(122,220,180) 0%, rgb(0,208,132) 100%)"
        },
        {
          "slug": "luminous-vivid-amber-to-luminous-vivid-orange",
          "name": "Luminous vivid amber to luminous vivid orange",
          "gradient": "linear-gradient(135deg, rgb(252,185,0) 0%, rgb(255,105,0) 100%)"
        },
        {
          "slug": "luminous-vivid-orange-to-vivid-red",
          "name": "Luminous vivid orange to vivid red",
          "gradient": "linear-gradient(135deg, rgb(255,105,0) 0%, rgb(207,46,46) 100%)"
        },
        {
          "slug": "very-light-gray-to-cyan-bluish-gray",
          "name": "Very light gray to cyan bluish gray",
          "gradient": "linear-gradient(135deg, rgb(238,238,238) 0%, rgb(169,184,195) 100%)"
        },
        {
          "slug": "cool-to-warm-spectrum",
          "name": "Cool to warm spectrum",
          "gradient": "linear-gradient(135deg, rgb(74,234,220) 0%, rgb(151,120,209) 20%, rgb(207,42,186) 40%, rgb(238,44,130) 60%, rgb(251,105,98) 80%, rgb(254,248,76) 100%)"
        }
      ];

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
        <div className="s1-field-control th-bg-control">
          <div class="s1-field-label">{label}</div>
              <div className="s1-color-panel">
                <div className='color-box-wrap' >
                <div className='color-box' style={{ background: value }} ref={ref} onClick={() => setOpen(true)}></div>
                <div className="color-input-wrap">
                <input class="color-input" type="text" value={value}   onChange={(e) =>onChange(e.target.value)} />
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
