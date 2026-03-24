import { __ } from '@wordpress/i18n';

import {
    RangeControl ,
} from '@wordpress/components';



export default function THRangeControl({
    range='px',
    label='lable', 
    defaultValue=0,
    value=0,
    max=100,
    min=0,
    onChange,
}){
//console.log(defaultValue);

 return (<div className='s1-field-control s1-control-range'>
         <RangeControl
      __nextHasNoMarginBottom
      __next40pxDefaultSize
      initialPosition={ defaultValue }
      label={label}
      max={ max }
      min={ min }
      value={ value }
      onChange={ (value)=>onChange(value) }
    />
    <span className='s1-rangetype'>{range}</span>
    </div>
    );
}