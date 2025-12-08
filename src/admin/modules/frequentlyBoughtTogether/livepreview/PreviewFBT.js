import { useState, useEffect } from '@wordpress/element';
import Style1 from "./Style1";
import Style2 from "./Style2";
import Style3 from "./Style3";
import './live-style.css';

const PreviewFBT = ({ settings = {} }) => {
    const [ready, setReady] = useState(false);

    const style = settings?.display_style; // ❌ NO fallback here

    useEffect(() => {
        if (style) {
            setReady(true);  // ✅ render only when real style arrives
        }
    }, [style]);

    // ✅ Loader until we get real saved style
    if (!ready) {
        return (
            <div className="s1-fbt-preview-loader">
                <div className="s1-spinner"></div>
            </div>
        );
    }

    if (style === 'style_1') return <Style1 settings={settings} />;
    if (style === 'style_2') return <Style2 settings={settings} />;
    if (style === 'style_3') return <Style3 settings={settings} />;

    return null;
};

export default PreviewFBT;
