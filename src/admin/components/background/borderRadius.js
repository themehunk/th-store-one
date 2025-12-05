import { useState } from 'react';
import { __ } from '@wordpress/i18n';

import {
    BorderBoxControl,
} from '@wordpress/components';

const colors = [
    { name: 'Blue 20', color: '#72aee6' },
    // ...
];

export default function THBorderRadius({ }){
        const defaultBorder = {
        color: '#72aee6',
        style: 'dashed',
        width: '1px',
    };
    const [ borders, setBorders ] = useState( {
        top: defaultBorder,
        right: defaultBorder,
        bottom: defaultBorder,
        left: defaultBorder,
    } );
    const onChange = ( newBorders ) => setBorders( newBorders );
 return (
        <BorderBoxControl
            __next40pxDefaultSize
            colors={ colors }
            label={ __( 'Borders' ) }
            onChange={ onChange }
            value={ borders }
        />
    );
    
}