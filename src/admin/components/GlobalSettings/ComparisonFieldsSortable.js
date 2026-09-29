import { ToggleControl } from "@wordpress/components";

const ComparisonFieldsSortable = ({ value = {}, onChange }) => {
  const fields = Object.entries(value);

  const handleDragStart = (event, index) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  };

  const handleDrop = (event, dropIndex) => {
    event.preventDefault();

    const dragIndex = Number(event.dataTransfer.getData("text/plain"));

    if (Number.isNaN(dragIndex) || dragIndex === dropIndex) {
      return;
    }

    const reordered = [...fields];
    const [movedItem] = reordered.splice(dragIndex, 1);

    reordered.splice(dropIndex, 0, movedItem);

    onChange(Object.fromEntries(reordered));
  };

  const toggleField = (key, active) => {
    onChange({
      ...value,
      [key]: {
        ...value[key],
        active: active ? 1 : 0,
      },
    });
  };

  return (
    <div className="s1-comparison-fields-sortable">
      {fields.map(([key, field], index) => (
        <div
          key={key}
          className="s1-comparison-field-item"
          draggable
          onDragStart={(event) => handleDragStart(event, index)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleDrop(event, index)}
        >
          <span className="s1-comparison-field-drag" aria-hidden="true">
            ⋮⋮
          </span>

          <span className="s1-comparison-field-label">
            {field.label || key.replace(/-/g, " ")}
          </span>

          <ToggleControl
            __nextHasNoMarginBottom
            checked={field.active === 1 || field.active === true}
            onChange={(checked) => toggleField(key, checked)}
          />
        </div>
      ))}
    </div>
  );
};

export default ComparisonFieldsSortable;
