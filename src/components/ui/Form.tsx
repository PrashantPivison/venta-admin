import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, children, required }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-semibold mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  const input = (
    <input
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      {...props}
    />
  );

  if (label) {
    return (
      <FormField label={label} error={error} required={props.required}>
        {input}
      </FormField>
    );
  }

  return input;
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, ...props }) => {
  const textarea = (
    <textarea
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      {...props}
    />
  );

  if (label) {
    return (
      <FormField label={label} error={error} required={props.required}>
        {textarea}
      </FormField>
    );
  }

  return textarea;
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { label: string; value: string }[];
  children?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, error, options, children, ...props }) => {
  const select = (
    <select
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      {...props}
    >
      {children || (options && options.length > 0 ? (
        <>
          <option value="">Select an option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </>
      ) : (
        <option value="">No options available</option>
      ))}
    </select>
  );

  if (label) {
    return (
      <FormField label={label} error={error} required={props.required}>
        {select}
      </FormField>
    );
  }

  return select;
};
