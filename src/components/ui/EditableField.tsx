import React, { useState, useEffect } from 'react';

interface EditableFieldProps {
  value: string;
  onSave: (val: string) => void;
  as?: "input" | "textarea";
  className?: string;
  placeholder?: string;
  rows?: number;
  name?: string;
  type?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({ 
  value, 
  onSave, 
  as: Component = "input", 
  className, 
  placeholder,
  rows,
  name,
  type = "text"
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    if (localValue !== value) {
      onSave(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (Component === "input" && e.key === 'Enter') {
      (e.currentTarget as HTMLElement).blur();
    } else if (e.key === 'Escape') {
      setLocalValue(value);
      (e.currentTarget as HTMLElement).blur();
    }
  };

  return (
    <Component
      name={name}
      type={Component === "input" ? type : undefined}
      value={localValue}
      onChange={(e: any) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      rows={rows}
      className={className}
    />
  );
};

export default EditableField;
