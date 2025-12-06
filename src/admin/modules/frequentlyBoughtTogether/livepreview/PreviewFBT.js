import Style1 from "./Style1";
import Style2 from "./Style2";
import Style3 from "./Style3";
import './live-style.css';

const PreviewFBT = ({ settings = {} }) => {
    const style = settings.display_style || "style_1";
    console.log("FBT Preview Settings:", style);
    const styleMap = {
        style_1: <Style1 settings={settings} />,
        style_2: <Style2 settings={settings} />,
        style_3: <Style3 settings={settings} />,
    };

    return styleMap[style] || styleMap.style_1;
};

export default PreviewFBT;
