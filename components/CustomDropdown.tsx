"use client"
import React, { useState } from "react";
import { BiChevronDown } from "react-icons/bi";
import { components, default as Select } from "react-select";

// Option type
interface OptionType {
  id: string | number;
  name: string;
  img?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface SelectDropDownProps {
  options: OptionType[];
  placeholder?: string;
  isClearable?: boolean;
  loader?: boolean;
  isErrorTitle?: boolean;
  error?: string;
  onChange?: (option: OptionType | null) => void;
  value?: OptionType | null;
  defaultValue?: OptionType | null;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components?: any;
}

// Loader inside dropdown
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MenuList = (props: any) => {
  const { loader, children } = props;

  return (
    <components.MenuList {...props}>
      {loader ? (
        <div style={{ textAlign: "center", padding: "10px" }}>
          <div className="w-full text-center flex justify-center p-2">
            <div className="loader" />
          </div>
        </div>
      ) : (
        children
      )}
    </components.MenuList>
  );
};

// Option (dropdown item) with flex layout
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomOption = (props: any) => {
  const { data, innerRef, innerProps } = props;

  return (
    <div
      ref={innerRef}
      {...innerProps}
      className="flex items-center justify-between p-2 rounded hover:bg-blue-50 cursor-pointer"
    >
      <div className="flex items-center">
        {data.img && (
          <img
            src={data.img}
            alt={data.name}
            className="w-8 h-8 rounded-full object-cover mr-2"
          />
        )}
        <span className="text-sm text-gray-700">{data.name}</span>
      </div>
    </div>
  );
};

// Selected value display with flex
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomSingleValue = (props: any) => {
  const { data } = props;

  return (
    <components.SingleValue {...props}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          {data?.img && (
            <img
              src={data?.img}
              alt={data?.name}
              className="w-8 h-8 rounded-full object-cover mr-2"
            />
          )}
          <span>{data?.name}</span>
        </div>
      </div>
    </components.SingleValue>
  );
};

const CustomDropdown: React.FC<SelectDropDownProps> = ({
  options,
  placeholder = "Select an option",
  isClearable = true,
  loader = false,
  isErrorTitle = true,
  onChange,
  error,
  value,
  defaultValue,
  disabled = false,
  components: customComponents,
}) => {
  const [isClient, setIsClient] = useState(false);

  React.useEffect(() => {
    setIsClient(true); // Only enable after mounting on the client
  }, []);

  if (!isClient) {
    return null; // Render nothing on the server
  }
  const modifiedOptions = options?.map((option) => ({
    ...option,
    value: option?.id,
    label: option?.name,
  }));

  const getMappedValue = (inputValue: OptionType | null) => {
    return inputValue
      ? { value: inputValue?.id, label: inputValue?.name, ...inputValue }
      : null;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (selectedOption: any) => {
    if (selectedOption) {
      const selectedValue = options.find((option) => option.id === selectedOption.value);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onChange && onChange(selectedValue || null);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onChange && onChange(null);
    }
  };

  const css = `
    .react-select__value-container{padding: 2px 12px}
    .react-select__input-container{margin: 0}
    .react-select__control{border-radius: 20px !important;border-color: #eaeaea !important;height: 40px !important;background-color: #fff !important;min-height: 40px !important}
    .react-select-container.dropdown-error .react-select__control {border-color: #ed5757 !important;}
    .react-select__control.react-select__control--is-focused.react-select__control--menu-is-open{--tw-shadow: 0px 0px 0px 1px #fff, 0px 0px 0px 3px #dbf2fe;box-shadow: var(--tw-shadow)}
    .react-select__control .downArrow{transition: all 0.5s}
    .react-select__control.react-select__control--is-focused.react-select__control--menu-is-open .downArrow{transform: rotate(180deg)}
    .react-select__control.react-select__control--is-focused{box-shadow: none}
    .react-select__placeholder{color: #a2a2a2 !important;font-size: 14px}
    .react-select__indicator-separator{display: none !important}
    .react-select__input-container input{height: auto !important;--tw-ring-shadow: none}
    .react-select__menu{z-index:30;padding: 8px}
    .react-select__control.react-select__control--is-disabled{background: #F7F7FE !important}
    .react-select__menu .react-select__option{border-radius: 6px;cursor: pointer;font-size: 0.875rem;line-height: 1.25rem;padding: 0.5rem;margin-bottom: 4px;color: #6b7280}
    .react-select__menu .react-select__option.react-select__option--is-selected{cursor: not-allowed;background: #f5f5f5}
    .react-select__menu .react-select__option:hover{background-color: #eef7ff;color: #2e94ea}
    .react-select__indicator.react-select__clear-indicator{cursor: pointer;padding: 6px;}
    .react-select__indicator.react-select__clear-indicator svg{width: 16px;fill: #2e94ea}
    .react-select__single-value{font-size: 14px;color: #000000}
    .react-select__menu-list{padding: 0}
  `;

  return (
    <>
      <style>{css}</style>
      <Select
        placeholder={placeholder}
        isClearable={isClearable}
        options={modifiedOptions}
        value={getMappedValue(value ?? null)}
        defaultValue={getMappedValue(defaultValue ?? null)}
        isDisabled={disabled}
        onChange={handleChange}
        className={`react-select-container ${error ? "dropdown-error" : ""} w-56`}
        classNamePrefix="react-select"
        components={{
          MenuList: (props) => <MenuList {...props} loader={loader} />,
          Option: CustomOption,
          SingleValue: CustomSingleValue,
          IndicatorSeparator: () => null,
          DropdownIndicator: (props) =>
            props.hasValue ? null : (
              <BiChevronDown
                size={20}
                className="relative right-2 fill-gray-p-250 cursor-pointer h-full downArrow"
              />
            ),
          ...customComponents,
        }}
      />
      {error && isErrorTitle && (
        <div className="text-status-danger-800 text-left text-xs mt-1">{error}</div>
      )}
    </>
  );
};

export default CustomDropdown;
