import React, { useState, useEffect, useRef } from 'react';

interface EditableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCommit?: (value: string) => void;
}

export const EditableInput: React.FC<EditableInputProps> = ({ value, defaultValue, onCommit, onKeyDown, onBlur, onChange, ...props }) => {
  const [tempValue, setTempValue] = useState((value ?? defaultValue)?.toString() || '');
  const isEditing = useRef(false);

  useEffect(() => {
    if (!isEditing.current) {
      setTempValue((value ?? defaultValue)?.toString() || '');
    }
  }, [value, defaultValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      isEditing.current = false;
      onCommit?.(tempValue);
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      isEditing.current = false;
      setTempValue((value ?? defaultValue)?.toString() || '');
      e.currentTarget.blur();
    }
    onKeyDown?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isEditing.current) {
      isEditing.current = false;
      onCommit?.(tempValue);
    }
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isEditing.current = true;
    setTempValue(e.target.value);
    onChange?.(e);
  };

  return (
    <input
      {...props}
      value={tempValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  );
};

interface EditableTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onCommit?: (value: string) => void;
}

export const EditableTextarea: React.FC<EditableTextareaProps> = ({ value, defaultValue, onCommit, onKeyDown, onBlur, onChange, ...props }) => {
  const [tempValue, setTempValue] = useState((value ?? defaultValue)?.toString() || '');
  const isEditing = useRef(false);

  useEffect(() => {
    if (!isEditing.current) {
      setTempValue((value ?? defaultValue)?.toString() || '');
    }
  }, [value, defaultValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      isEditing.current = false;
      onCommit?.(tempValue);
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      isEditing.current = false;
      setTempValue((value ?? defaultValue)?.toString() || '');
      e.currentTarget.blur();
    }
    onKeyDown?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (isEditing.current) {
      isEditing.current = false;
      onCommit?.(tempValue);
    }
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    isEditing.current = true;
    setTempValue(e.target.value);
    onChange?.(e);
  };

  return (
    <textarea
      {...props}
      value={tempValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  );
};
