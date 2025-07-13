import React from "react";
import "../asset/logo/Logo.css"; // Assuming you have a CSS file for the logo styles

type HeaderProps = {
  prompt: string;
};

const Header: React.FC<HeaderProps> = ({ prompt }) => {
  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-5">
      <div className="logo-horizontal mb-2">
        <div className="logo-small">
          <div className="logo-symbol">
            <span className="bracket">{"{"}</span>
            <span>SS</span>
            <span className="bracket">{"}"}</span>
          </div>
          <div className="brain-icon mr-4 mt-4" />
          <div className="bolt-icon ml-4 mb-4" />
        </div>
        <div className="text">SmartSharma</div>
      </div>

      <p className="text-sm text-gray-400 text-center sm:text-left">
        <span className="font-semibold text-gray-300">Prompt:</span> {prompt}
      </p>
    </header>
  );
};

export default Header;
