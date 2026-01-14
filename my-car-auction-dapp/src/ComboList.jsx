import { useState } from "react";
import "./ComboList.css";

const ComboList = ({
  items = [],
  placeholder = "Select an item...",
  handleItemChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter items based on search term
  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSelect = (item, index) => {
    setSelectedItem(item);
    setSearchTerm(item);
    handleItemChange(index);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedItem(value);

    // Open dropdown when typing (if not already open)
    if (!isOpen && value) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    if (filteredItems.length > 0) {
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    setSelectedItem("");
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="combo-list-container">
      <div className="combo-list-wrapper">
        <div className="combo-list-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="combo-list-input"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          />
          <div className="combo-list-buttons">
            {selectedItem && (
              <button
                type="button"
                onClick={handleClear}
                className="combo-list-clear"
                aria-label="Clear selection"
              >
                ×
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="combo-list-toggle"
              aria-label={isOpen ? "Close dropdown" : "Open dropdown"}
            >
              {isOpen ? "▲" : "▼"}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="combo-list-dropdown">
            {filteredItems.length > 0 ? (
              <ul
                className="combo-list-items"
                role="listbox"
                aria-label="Select an item"
              >
                {filteredItems.map((item, index) => (
                  <li
                    key={`item-${"" + index}`}
                    onClick={() => handleSelect(item, index)}
                    className={`combo-list-item ${
                      selectedItem === item ? "selected" : ""
                    }`}
                    role="option"
                    aria-selected={selectedItem === item}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleSelect(item, item, index);
                      }
                    }}
                  >
                    {index}: {item}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="combo-list-no-results">
                No matching items found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComboList;
