import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AsYouType, CountryCode, getCountryCallingCode } from 'libphonenumber-js';
import { countries } from '../lib/countries';
import { Search, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// A subset of countries for the example, but can be expanded to a full list
const supportedCountries = countries.map(c => c.code as CountryCode);

interface PhoneInputProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ name, value: controlledValue, defaultValue, onChange, className }) => {
  const [internalValue, setInternalValue] = useState(controlledValue || defaultValue || '');
  const [country, setCountry] = useState<CountryCode>('US');
  
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = (val: string) => {
    setInternalValue(val);
    onChange?.(val);
  };
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = useMemo(() => 
    countries.find(c => c.code === country) || countries.find(c => c.code === 'US')!
  , [country]);

  const filteredCountries = useMemo(() => 
    countries.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.code.toLowerCase().includes(search.toLowerCase())
    )
  , [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    let callingCode = '';
    try {
      callingCode = `+${getCountryCallingCode(country)}`;
    } catch (e) {
      callingCode = '+1';
    }

    // Ensure it always starts with the calling code
    if (!input.startsWith(callingCode)) {
      // If it doesn't start with the code, it means the user tried to delete it
      // We force it back
      input = callingCode + ' ' + input.replace(/^\+?\d*/, '').trim();
    }

    const formatter = new AsYouType(country);
    const formatted = formatter.input(input);
    
    setValue(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    let callingCode = '';
    try {
      callingCode = `+${getCountryCallingCode(country)}`;
    } catch (e) {
      callingCode = '+1';
    }

    const selectionStart = e.currentTarget.selectionStart || 0;

    // Prevent backspace from deleting the country code
    // We add 1 for the space that usually follows the code
    if (e.key === 'Backspace' && selectionStart <= callingCode.length + 1) {
      e.preventDefault();
    }
    
    // Prevent delete key from deleting the country code if cursor is at the start
    if (e.key === 'Delete' && selectionStart < callingCode.length) {
      e.preventDefault();
    }
  };

  const handleCursorLock = (e: React.FocusEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>) => {
    let callingCode = '';
    try {
      callingCode = `+${getCountryCallingCode(country)}`;
    } catch (e) {
      callingCode = '+1';
    }
    
    const target = e.target as HTMLInputElement;
    // If cursor is within the country code, move it to the end
    if (target.selectionStart !== null && target.selectionStart <= callingCode.length + 1) {
      const len = target.value.length;
      target.setSelectionRange(len, len);
    }
  };

  const handleCountrySelect = (code: CountryCode) => {
    setCountry(code);
    setIsOpen(false);
    setSearch('');
    
    let callingCode = '';
    try {
      callingCode = getCountryCallingCode(code);
    } catch (e) {
      console.warn(`Could not get calling code for ${code}`);
    }
    
    // If the value starts with +, try to replace the existing country code
    if (value.startsWith('+')) {
      // Find the first space or the end of the country code part
      // libphonenumber-js formatting usually puts a space after the country code
      const parts = value.split(' ');
      if (parts.length > 0) {
        parts[0] = `+${callingCode}`;
        const newValue = parts.join(' ');
        const formatter = new AsYouType(code);
        setValue(formatter.input(newValue));
      } else {
        setValue(`+${callingCode} `);
      }
    } else {
      // If it doesn't start with +, just prepend the new country code
      const newValue = `+${callingCode} ${value}`;
      const formatter = new AsYouType(code);
      setValue(formatter.input(newValue));
    }
  };

  // Initial formatting if value exists
  useEffect(() => {
    if (controlledValue) {
        const formatter = new AsYouType();
        const formatted = formatter.input(controlledValue);
        if (formatter.getCountry()) {
            setCountry(formatter.getCountry() as CountryCode);
        }
        setInternalValue(formatted);
    } else if (!controlledValue && !internalValue) {
        // Default to US calling code if empty
        setInternalValue('+1 ');
    }
  }, [controlledValue]);

  return (
    <div className="relative flex items-center group/phone">
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} />
      
      {/* Country Selector */}
      <div className="absolute left-0 h-full flex items-center z-10 pointer-events-none">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-8 h-full hover:bg-accent/5 transition-colors rounded-l-lg border-r border-border/50 pointer-events-auto"
        >
          <span className="text-[8px] font-bold text-muted leading-none flex items-center justify-center">{selectedCountry.code}</span>
        </button>
      </div>

      {/* Phone Input */}
      <input
        type="tel"
        value={value}
        onChange={handlePhoneChange}
        onKeyDown={handleKeyDown}
        onFocus={handleCursorLock}
        onClick={handleCursorLock}
        placeholder={selectedCountry.code === 'US' ? '+1 (555) 000-0000' : 'Phone Number'}
        className={cn(
          "w-full h-7 bg-bg border border-border rounded-lg pl-9 pr-1.5 text-[9px] text-fg focus:outline-none focus:border-accent/50 transition-all font-medium flex items-center",
          className
        )}
      />

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute top-full left-0 mt-1 w-48 max-h-48 bg-surface border border-border rounded-lg shadow-xl z-[200] overflow-hidden flex flex-col"
          >
            {/* Search */}
            <div className="p-1 border-b border-border bg-surface/50 sticky top-0">
              <div className="relative flex items-center">
                <Search className="absolute left-1.5 w-2 h-2 text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search countries..."
                  className="w-full bg-bg border border-border rounded px-4 py-0.5 text-[7px] focus:outline-none focus:border-accent/50"
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {filteredCountries.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCountrySelect(c.code as CountryCode)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1 hover:bg-accent/5 transition-colors text-left",
                    country === c.code && "bg-accent/10"
                  )}
                >
                  <span className="text-[10px]">{c.flag}</span>
                  <span className="text-[8px] font-medium text-fg truncate flex-1">{c.name}</span>
                  <span className="text-[6px] font-bold text-muted uppercase">
                    {(() => {
                      try {
                        return `+${getCountryCallingCode(c.code as CountryCode)}`;
                      } catch (e) {
                        return '';
                      }
                    })()}
                  </span>
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <div className="px-2 py-4 text-center">
                  <p className="text-[7px] text-muted">No countries found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
