import React from "react";
import "./Logo.css"; // Import corresponding styles

const Logo: React.FC = () => {
  return (
    <>
      <div className="logo-main">
        <div className="logo-icon">
          <div className="circuit-lines">
            <div className="circuit-line"></div>
            <div className="circuit-line"></div>
            <div className="circuit-line"></div>
          </div>
          <div className="logo-symbol">
            <span className="bracket">{"{"}</span>
            <span>SS</span>
            <span className="bracket">{"}"}</span>
          </div>
          <div className="brain-icon"></div>
          <div className="bolt-icon"></div>
        </div>
      </div>
    </>
  );
};

export default Logo;
